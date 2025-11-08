@extends('layouts.tenant')

@section('title', 'Profile Instansi')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-building mr-2"></i>
                        Profile Instansi
                    </h3>
                    <div class="card-tools">
                        <a href="{{ route('tenant.public-page.profile.edit', ['tenant' => request()->route('tenant')]) }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-edit mr-1"></i>
                            Edit Profile
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <i class="fas fa-check-circle mr-2"></i>
                            {{ session('success') }}
                            <button type="button" class="close" data-dismiss="alert">
                                <span>&times;</span>
                            </button>
                        </div>
                    @endif

                    <div class="row">
                        <!-- Logo dan Info Dasar -->
                        <div class="col-md-4">
                            <div class="text-center mb-4">
                                @if($profile->logo)
                                    <img src="{{ asset($profile->logo) }}" alt="Logo {{ $profile->institution_name }}" 
                                         class="img-fluid rounded" style="max-height: 200px;">
                                @else
                                    <div class="bg-light rounded d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-building fa-3x text-muted"></i>
                                    </div>
                                @endif
                            </div>
                            
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Informasi Kontak</h5>
                                </div>
                                <div class="card-body">
                                    @if($profile->phone)
                                        <p class="mb-2">
                                            <i class="fas fa-phone text-primary mr-2"></i>
                                            {{ $profile->phone }}
                                        </p>
                                    @endif
                                    
                                    @if($profile->email)
                                        <p class="mb-2">
                                            <i class="fas fa-envelope text-primary mr-2"></i>
                                            <a href="mailto:{{ $profile->email }}">{{ $profile->email }}</a>
                                        </p>
                                    @endif
                                    
                                    @if($profile->website)
                                        <p class="mb-2">
                                            <i class="fas fa-globe text-primary mr-2"></i>
                                            <a href="{{ $profile->website }}" target="_blank">{{ $profile->website }}</a>
                                        </p>
                                    @endif
                                    
                                    @if($profile->address)
                                        <p class="mb-0">
                                            <i class="fas fa-map-marker-alt text-primary mr-2"></i>
                                            {{ $profile->address }}
                                            @if($profile->city)
                                                , {{ $profile->city }}
                                            @endif
                                            @if($profile->province)
                                                , {{ $profile->province }}
                                            @endif
                                            @if($profile->postal_code)
                                                {{ $profile->postal_code }}
                                            @endif
                                        </p>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Detail Profile -->
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Detail Instansi</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Nama Instansi:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->institution_name ?? '-' }}</p>
                                        </div>
                                    </div>

                                    @if($profile->institution_type)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Jenis Instansi:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->institution_type }}</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->slogan)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Slogan:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3 font-italic">"{{ $profile->slogan }}"</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->description)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Deskripsi:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->description }}</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->vision)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Visi:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->vision }}</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->mission)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>Misi:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->mission }}</p>
                                        </div>
                                    </div>
                                    @endif
                                </div>
                            </div>

                            <!-- SEO Information -->
                            @if($profile->seo_title || $profile->seo_description || $profile->seo_keywords)
                            <div class="card mt-3">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Informasi SEO</h5>
                                </div>
                                <div class="card-body">
                                    @if($profile->seo_title)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>SEO Title:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->seo_title }}</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->seo_description)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>SEO Description:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->seo_description }}</p>
                                        </div>
                                    </div>
                                    @endif

                                    @if($profile->seo_keywords)
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <strong>SEO Keywords:</strong>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-3">{{ $profile->seo_keywords }}</p>
                                        </div>
                                    </div>
                                    @endif
                                </div>
                            </div>
                            @endif

                            <!-- Social Media -->
                            @if($profile->social_media && is_array($profile->social_media))
                            <div class="card mt-3">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Media Sosial</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        @foreach($profile->social_media as $platform => $url)
                                        <div class="col-md-6 mb-2">
                                            <strong>{{ ucfirst($platform) }}:</strong>
                                            <a href="{{ $url }}" target="_blank" class="ml-2">{{ $url }}</a>
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Auto-hide success message after 5 seconds
    setTimeout(function() {
        $('.alert-success').fadeOut();
    }, 5000);
});
</script>
@endpush
