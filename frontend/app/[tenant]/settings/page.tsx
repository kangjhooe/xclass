'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SettingsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const tenantNpsn = params?.tenant as string;

  useEffect(() => {
    if (tenantNpsn) {
      router.replace(`/${tenantNpsn}/data-pokok`);
    }
  }, [tenantNpsn, router]);

  return null;
}

