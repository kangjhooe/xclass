'use client';

import { useState, useEffect, useCallback } from 'react';
import { wilayahIndonesiaApi, Province, Regency, District, Village } from '@/lib/api/wilayah-indonesia';
import { Select } from '@/components/ui/Select';

export interface AddressCascadeProps {
  provinceName?: string;
  regencyName?: string;
  districtName?: string;
  villageName?: string;
  onProvinceChange?: (name: string) => void;
  onRegencyChange?: (name: string) => void;
  onDistrictChange?: (name: string) => void;
  onVillageChange?: (name: string) => void;
  showLabels?: boolean;
  className?: string;
  required?: boolean;
  error?: {
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  };
}

export function AddressCascade({
  provinceName,
  regencyName,
  districtName,
  villageName,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  showLabels = true,
  className = '',
  required = false,
  error,
}: AddressCascadeProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  });

  // Internal state for codes (used for cascading)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedVillageCode, setSelectedVillageCode] = useState<string>('');

  // Load provinces on mount and find matching code from name
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await wilayahIndonesiaApi.getProvinces();
        setProvinces(data);
        // Find matching code from name if provided
        if (provinceName && data.length > 0) {
          const matched = data.find((p) => p.name === provinceName);
          if (matched) {
            setSelectedProvinceCode(matched.code);
          }
        }
      } catch (error) {
        console.error('Failed to load provinces:', error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, [provinceName]);

  // Load regencies when province changes
  useEffect(() => {
    const loadRegencies = async () => {
      if (!selectedProvinceCode) {
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        return;
      }
      setLoading((prev) => ({ ...prev, regencies: true }));
      try {
        const data = await wilayahIndonesiaApi.getRegencies(selectedProvinceCode);
        setRegencies(data);
        // Find matching code from name if provided
        if (regencyName && data.length > 0) {
          const matched = data.find((r) => r.name === regencyName);
          if (matched) {
            setSelectedRegencyCode(matched.code);
          }
        }
        // Reset child selections if province changes and no match found
        if (!regencyName) {
          if (onRegencyChange) onRegencyChange('');
          if (onDistrictChange) onDistrictChange('');
          if (onVillageChange) onVillageChange('');
          setDistricts([]);
          setVillages([]);
        }
      } catch (error) {
        console.error('Failed to load regencies:', error);
      } finally {
        setLoading((prev) => ({ ...prev, regencies: false }));
      }
    };
    loadRegencies();
  }, [selectedProvinceCode, regencyName, onRegencyChange, onDistrictChange, onVillageChange]);

  // Load districts when regency changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedRegencyCode) {
        setDistricts([]);
        setVillages([]);
        return;
      }
      setLoading((prev) => ({ ...prev, districts: true }));
      try {
        const data = await wilayahIndonesiaApi.getDistricts(selectedRegencyCode);
        setDistricts(data);
        // Find matching code from name if provided
        if (districtName && data.length > 0) {
          const matched = data.find((d) => d.name === districtName);
          if (matched) {
            setSelectedDistrictCode(matched.code);
          }
        }
        // Reset child selections if regency changes and no match found
        if (!districtName) {
          if (onDistrictChange) onDistrictChange('');
          if (onVillageChange) onVillageChange('');
          setVillages([]);
        }
      } catch (error) {
        console.error('Failed to load districts:', error);
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    loadDistricts();
  }, [selectedRegencyCode, districtName, onDistrictChange, onVillageChange]);

  // Load villages when district changes
  useEffect(() => {
    const loadVillages = async () => {
      if (!selectedDistrictCode) {
        setVillages([]);
        return;
      }
      setLoading((prev) => ({ ...prev, villages: true }));
      try {
        const data = await wilayahIndonesiaApi.getVillages(selectedDistrictCode);
        setVillages(data);
        // Find matching code from name if provided
        if (villageName && data.length > 0) {
          const matched = data.find((v) => v.name === villageName);
          if (matched) {
            setSelectedVillageCode(matched.code);
          }
        }
        // Reset village selection if district changes and no match found
        if (!villageName && onVillageChange) {
          onVillageChange('');
        }
      } catch (error) {
        console.error('Failed to load villages:', error);
      } finally {
        setLoading((prev) => ({ ...prev, villages: false }));
      }
    };
    loadVillages();
  }, [selectedDistrictCode, villageName, onVillageChange]);

  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = provinces.find((p) => p.code === code);
    setSelectedProvinceCode(code);
    if (onProvinceChange && selected) {
      onProvinceChange(selected.name);
    } else if (onProvinceChange) {
      onProvinceChange('');
    }
  }, [provinces, onProvinceChange]);

  const handleRegencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = regencies.find((r) => r.code === code);
    setSelectedRegencyCode(code);
    if (onRegencyChange && selected) {
      onRegencyChange(selected.name);
    } else if (onRegencyChange) {
      onRegencyChange('');
    }
  }, [regencies, onRegencyChange]);

  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = districts.find((d) => d.code === code);
    setSelectedDistrictCode(code);
    if (onDistrictChange && selected) {
      onDistrictChange(selected.name);
    } else if (onDistrictChange) {
      onDistrictChange('');
    }
  }, [districts, onDistrictChange]);

  const handleVillageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = villages.find((v) => v.code === code);
    setSelectedVillageCode(code);
    if (onVillageChange && selected) {
      onVillageChange(selected.name);
    } else if (onVillageChange) {
      onVillageChange('');
    }
  }, [villages, onVillageChange]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <Select
          label={showLabels ? 'Provinsi' : undefined}
          value={selectedProvinceCode || ''}
          onChange={handleProvinceChange}
          placeholder="Pilih Provinsi"
          required={required}
          error={error?.province}
          disabled={loading.provinces}
          options={provinces.map((p) => ({ value: p.code, label: p.name }))}
        />
      </div>

      <div>
        <Select
          label={showLabels ? 'Kabupaten/Kota' : undefined}
          value={selectedRegencyCode || ''}
          onChange={handleRegencyChange}
          placeholder="Pilih Kabupaten/Kota"
          required={required && !!selectedProvinceCode}
          error={error?.regency}
          disabled={loading.regencies || !selectedProvinceCode}
          options={regencies.map((r) => ({ value: r.code, label: r.name }))}
        />
      </div>

      <div>
        <Select
          label={showLabels ? 'Kecamatan' : undefined}
          value={selectedDistrictCode || ''}
          onChange={handleDistrictChange}
          placeholder="Pilih Kecamatan"
          required={required && !!selectedRegencyCode}
          error={error?.district}
          disabled={loading.districts || !selectedRegencyCode}
          options={districts.map((d) => ({ value: d.code, label: d.name }))}
        />
      </div>

      <div>
        <Select
          label={showLabels ? 'Kelurahan/Desa' : undefined}
          value={selectedVillageCode || ''}
          onChange={handleVillageChange}
          placeholder="Pilih Kelurahan/Desa"
          required={required && !!selectedDistrictCode}
          error={error?.village}
          disabled={loading.villages || !selectedDistrictCode}
          options={villages.map((v) => ({ value: v.code, label: v.name }))}
        />
      </div>
    </div>
  );
}

