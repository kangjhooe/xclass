@extends('layouts.tenant')

@section('title', $gallery->title)

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <!-- Breadcrumb -->
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item">
                                <a href="/{{ request()->route('tenant') }}">Beranda</a>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="{{ route('public.gallery.index', ['tenant' => request()->route('tenant')]) }}">Galeri</a>
                            </li>
                            <li class="breadcrumb-item active" aria-current="page">{{ $gallery->title }}</li>
                        </ol>
                    </nav>

                    <!-- Gallery Header -->
                    <div class="mb-4">
                        <h1 class="h2 mb-3">{{ $gallery->title }}</h1>
                        <div class="text-muted small mb-3">
                            <i class="fas fa-calendar mr-2"></i>
                            {{ $gallery->created_at->format('d M Y H:i') }}
                        </div>
                    </div>

                    <!-- Gallery Image -->
                    @if($gallery->image)
                    <div class="mb-4 text-center">
                        <img src="{{ asset($gallery->image) }}" alt="{{ $gallery->title }}" class="img-fluid rounded shadow">
                    </div>
                    @endif

                    <!-- Gallery Description -->
                    @if($gallery->description)
                    <div class="mb-4">
                        <h5>Deskripsi</h5>
                        <p class="text-muted">{{ $gallery->description }}</p>
                    </div>
                    @endif

                    <!-- Gallery Tags -->
                    @if($gallery->tags)
                    <div class="mb-4">
                        <h6>Tag:</h6>
                        <div class="d-flex flex-wrap">
                            @foreach(explode(',', $gallery->tags) as $tag)
                            <span class="badge bg-secondary me-2 mb-2">{{ trim($tag) }}</span>
                            @endforeach
                        </div>
                    </div>
                    @endif

                    <!-- Navigation -->
                    <div class="mt-5 pt-4 border-top">
                        <div class="row">
                            <div class="col-md-6">
                                <a href="{{ route('public.gallery.index', ['tenant' => request()->route('tenant')]) }}" class="btn btn-outline-primary">
                                    <i class="fas fa-arrow-left mr-2"></i>
                                    Kembali ke Galeri
                                </a>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <a href="/{{ request()->route('tenant') }}" class="btn btn-primary">
                                    <i class="fas fa-home mr-2"></i>
                                    Beranda
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
