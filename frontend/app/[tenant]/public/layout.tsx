import { ReactNode } from 'react';
import { PublicPageScaffold } from './_components/PublicPageScaffold';

type LayoutProps = {
  children: ReactNode;
  params: { tenant: string };
};

export default function TenantPublicLayout({ children, params }: LayoutProps) {
  return <PublicPageScaffold tenantId={params.tenant}>{children}</PublicPageScaffold>;
}

