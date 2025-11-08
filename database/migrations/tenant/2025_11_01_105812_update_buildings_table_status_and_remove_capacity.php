<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite tidak mendukung MODIFY COLUMN, jadi kita perlu membuat tabel baru
        if (DB::getDriverName() === 'sqlite') {
            // Cek apakah tabel buildings_old sudah ada (rollback sebelumnya)
            if (Schema::hasTable('buildings_old')) {
                Schema::dropIfExists('buildings_old');
            }
            
            // Backup data
            $buildings = DB::table('buildings')->get();
            
            // Rename tabel lama
            Schema::rename('buildings', 'buildings_old');
            
            // Buat tabel baru dengan struktur yang benar
            Schema::create('buildings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
                $table->uuid('land_id')->nullable();
                $table->string('name');
                $table->text('description')->nullable();
                $table->integer('floors')->default(1);
                $table->string('status')->default('baik'); // SQLite tidak support ENUM, gunakan string
                $table->timestamps();
            });
            
            // Buat index setelah tabel dibuat
            Schema::table('buildings', function (Blueprint $table) {
                $table->index(['instansi_id', 'status']);
            });
            
            // Tambahkan foreign key land_id jika belum ada
            try {
                Schema::table('buildings', function (Blueprint $table) {
                    $table->foreign('land_id')->references('id')->on('lands')->onDelete('set null');
                });
            } catch (\Exception $e) {
                // Foreign key mungkin sudah ada atau table lands belum ada
            }
            
            // Copy data dengan mapping status
            foreach ($buildings as $building) {
                $status = 'baik';
                if ($building->status == 'active') {
                    $status = 'baik';
                } elseif ($building->status == 'inactive') {
                    $status = 'rusak_ringan';
                } elseif ($building->status == 'maintenance') {
                    $status = 'rusak_berat';
                }
                
                // Hapus capacity dari data jika ada
                $data = [
                    'id' => $building->id,
                    'instansi_id' => $building->instansi_id,
                    'land_id' => $building->land_id ?? null,
                    'name' => $building->name,
                    'description' => $building->description,
                    'floors' => $building->floors,
                    'status' => $status,
                    'created_at' => $building->created_at,
                    'updated_at' => $building->updated_at,
                ];
                
                DB::table('buildings')->insert($data);
            }
            
            // Drop tabel lama
            Schema::dropIfExists('buildings_old');
        } else {
            // Untuk MySQL/MariaDB
            Schema::table('buildings', function (Blueprint $table) {
                $table->dropColumn('capacity');
            });
            
            // Update status dengan raw SQL
            DB::statement("ALTER TABLE buildings MODIFY COLUMN status ENUM('baik', 'rusak_ringan', 'rusak_berat', 'rusak_total') DEFAULT 'baik'");
            
            // Update data existing
            DB::table('buildings')->where('status', 'active')->update(['status' => 'baik']);
            DB::table('buildings')->where('status', 'inactive')->update(['status' => 'rusak_ringan']);
            DB::table('buildings')->where('status', 'maintenance')->update(['status' => 'rusak_berat']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // Backup data
            $buildings = DB::table('buildings')->get();
            
            // Rename tabel
            Schema::rename('buildings', 'buildings_old');
            
            // Buat tabel lama
            Schema::create('buildings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
                $table->uuid('land_id')->nullable();
                $table->string('name');
                $table->text('description')->nullable();
                $table->integer('floors')->default(1);
                $table->integer('capacity')->default(0);
                $table->string('status')->default('active');
                $table->timestamps();
            });
            
            Schema::table('buildings', function (Blueprint $table) {
                $table->index(['instansi_id', 'status']);
                $table->foreign('land_id')->references('id')->on('lands')->onDelete('set null');
            });
            
            // Copy data kembali
            foreach ($buildings as $building) {
                $status = 'active';
                if ($building->status == 'baik') {
                    $status = 'active';
                } elseif ($building->status == 'rusak_ringan') {
                    $status = 'inactive';
                } elseif ($building->status == 'rusak_berat' || $building->status == 'rusak_total') {
                    $status = 'maintenance';
                }
                
                DB::table('buildings')->insert([
                    'id' => $building->id,
                    'instansi_id' => $building->instansi_id,
                    'land_id' => $building->land_id ?? null,
                    'name' => $building->name,
                    'description' => $building->description,
                    'floors' => $building->floors,
                    'capacity' => 0,
                    'status' => $status,
                    'created_at' => $building->created_at,
                    'updated_at' => $building->updated_at,
                ]);
            }
            
            Schema::dropIfExists('buildings_old');
        } else {
            // Untuk MySQL/MariaDB
            DB::statement("ALTER TABLE buildings MODIFY COLUMN status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active'");
            
            DB::table('buildings')->where('status', 'baik')->update(['status' => 'active']);
            DB::table('buildings')->where('status', 'rusak_ringan')->update(['status' => 'inactive']);
            DB::table('buildings')->where('status', 'rusak_berat')->update(['status' => 'maintenance']);
            DB::table('buildings')->where('status', 'rusak_total')->update(['status' => 'maintenance']);
            
            Schema::table('buildings', function (Blueprint $table) {
                $table->integer('capacity')->default(0)->after('floors');
            });
        }
    }
};
