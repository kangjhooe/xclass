<?php

namespace App\Core\Services\PPDB;

use App\Models\PPDBApplication;
use App\Models\PPDBConfiguration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SelectionService
{
    public static function runSelection(PPDBConfiguration $config): array
    {
        $quotas = $config->quotas ?? [];

        // Ambil semua aplikasi pada tahun ajaran & gelombang terkait
        $apps = PPDBApplication::query()
            ->where('academic_year', $config->academic_year)
            ->where('batch', $config->batch_name)
            ->get();

        $accepted = collect();
        $rejected = collect();

        // Kelompokkan per jurusan
        $byMajor = $apps->groupBy('major_choice');

        foreach ($byMajor as $major => $appsInMajor) {
            $majorQuotas = $quotas[$major] ?? null; // bisa null (tanpa jalur)

            if (is_array($majorQuotas) && !empty($majorQuotas)) {
                // Seleksi per jalur
                foreach ($majorQuotas as $path => $quota) {
                    $candidates = $appsInMajor->where('registration_path', $path);
                    [$acc, $rej] = self::selectByQuota($candidates, (int) $quota);
                    $accepted = $accepted->merge($acc);
                    $rejected = $rejected->merge($rej);
                }

                // Sisa kandidat yang tidak tercakup jalur (path lain) ditolak
                $coveredPaths = array_keys($majorQuotas);
                $others = $appsInMajor->filter(function ($a) use ($coveredPaths) {
                    return !in_array($a->registration_path, $coveredPaths);
                });
                $rejected = $rejected->merge($others);
            } else {
                // Tidak ada kuota per jalur: seluruh jurusan, gunakan total kuota jika ada
                $quotaTotal = is_int($majorQuotas) ? $majorQuotas : null;
                $candidates = $appsInMajor;
                [$acc, $rej] = self::selectByQuota($candidates, $quotaTotal);
                $accepted = $accepted->merge($acc);
                $rejected = $rejected->merge($rej);
            }
        }

        // Tulis hasil ke DB dalam transaksi
        DB::transaction(function () use ($accepted, $rejected) {
            $now = now();
            // Tandai diterima
            foreach ($accepted as $app) {
                $app->update([
                    'status' => PPDBApplication::STATUS_ACCEPTED,
                    'announcement_date' => $now,
                ]);
            }
            // Tandai ditolak
            foreach ($rejected as $app) {
                $app->update([
                    'status' => PPDBApplication::STATUS_REJECTED,
                    'announcement_date' => $now,
                ]);
            }
        });

        return [
            'accepted' => $accepted->pluck('id')->all(),
            'rejected' => $rejected->pluck('id')->all(),
        ];
    }

    protected static function selectByQuota(Collection $candidates, ?int $quota): array
    {
        // Urutkan: total_score desc, created_at asc sebagai tie-breaker
        $sorted = $candidates->sort(function ($a, $b) {
            $as = $a->total_score ?? -1; $bs = $b->total_score ?? -1;
            if ($as === $bs) { return $a->created_at <=> $b->created_at; }
            return $as < $bs ? 1 : -1;
        })->values();

        if (is_null($quota)) {
            // Tanpa kuota → terima semua yang punya skor (>=0), selain itu tolak
            $acc = $sorted->filter(fn($x) => isset($x->total_score));
            $rej = $sorted->filter(fn($x) => !isset($x->total_score));
            return [$acc, $rej];
        }

        $accepted = $sorted->take($quota);
        $rejected = $sorted->slice($quota);
        return [$accepted, $rejected];
    }
}


