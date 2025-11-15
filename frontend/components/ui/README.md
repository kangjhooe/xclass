# UI Components Library

**Version: 0.1**

Koleksi komponen UI yang reusable, modern, dan menarik untuk aplikasi CLASS.

## 📦 Komponen yang Tersedia

### Layout Components

#### Card
Komponen card dengan berbagai variasi padding dan hover effect.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card hover padding="md">
  <CardHeader>
    <CardTitle>Judul Card</CardTitle>
    <CardDescription>Deskripsi card</CardDescription>
  </CardHeader>
  <CardContent>
    Konten card
  </CardContent>
  <CardFooter>
    Footer card
  </CardFooter>
</Card>
```

#### Divider
Pemisah horizontal atau vertikal dengan opsi teks di tengah.

```tsx
import { Divider } from '@/components/ui';

<Divider />
<Divider text="atau" />
<Divider orientation="vertical" />
```

### Data Display

#### DataTable
Tabel data dengan fitur sorting, filtering, dan pagination.

```tsx
import { DataTable, type Column } from '@/components/ui';

const columns: Column<User>[] = [
  { key: 'name', header: 'Nama', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { 
    key: 'status', 
    header: 'Status',
    render: (value) => <Badge variant={value === 'active' ? 'success' : 'danger'}>{value}</Badge>
  },
];

<DataTable
  data={users}
  columns={columns}
  searchable
  pagination
  pageSize={10}
  onRowClick={(row) => console.log(row)}
/>
```

#### Badge
Badge untuk menampilkan status atau label.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Aktif</Badge>
<Badge variant="danger">Tidak Aktif</Badge>
<Badge variant="warning" size="lg">Peringatan</Badge>
```

#### Avatar
Avatar dengan fallback ke inisial.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

<Avatar src="/avatar.jpg" name="John Doe" size="lg" />
<Avatar name="Jane Doe" size="md" />

<AvatarGroup>
  <Avatar name="User 1" />
  <Avatar name="User 2" />
  <Avatar name="User 3" />
</AvatarGroup>
```

#### Progress
Progress bar dengan berbagai variasi.

```tsx
import { Progress } from '@/components/ui';

<Progress value={75} max={100} variant="success" showLabel />
```

#### Skeleton
Loading skeleton untuk berbagai elemen.

```tsx
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '@/components/ui';

<Skeleton width={200} height={20} />
<SkeletonText lines={3} />
<SkeletonAvatar size="lg" />
<SkeletonCard />
```

### Feedback

#### Alert
Alert dengan berbagai tipe dan opsi close.

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Berhasil!" onClose={() => {}}>
  Data berhasil disimpan
</Alert>

<Alert variant="error" title="Error">
  Terjadi kesalahan
</Alert>
```

### Navigation

#### Tabs
Tab component dengan Context API.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

<Tabs defaultValue="tab1" onChange={(value) => console.log(value)}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Konten Tab 1</TabsContent>
  <TabsContent value="tab2">Konten Tab 2</TabsContent>
</Tabs>
```

#### Dropdown
Dropdown menu dengan positioning.

```tsx
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';

<Dropdown trigger={<Button>Menu</Button>} align="right">
  <DropdownItem icon="📝" onClick={() => {}}>Edit</DropdownItem>
  <DropdownItem icon="📋" onClick={() => {}}>Copy</DropdownItem>
  <DropdownSeparator />
  <DropdownItem icon="🗑️" onClick={() => {}}>Delete</DropdownItem>
</Dropdown>
```

### Form Controls

#### Switch
Toggle switch dengan label dan deskripsi.

```tsx
import { Switch } from '@/components/ui';

<Switch 
  label="Aktifkan notifikasi" 
  description="Terima notifikasi via email"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### Overlay

#### Tooltip
Tooltip dengan berbagai posisi.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Ini adalah tooltip" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

## 🎨 Styling

Semua komponen menggunakan Tailwind CSS dan mendukung:
- Custom className
- Responsive design
- Dark mode ready (dapat ditambahkan)
- Accessibility (ARIA attributes)

## 📝 Catatan

- Semua komponen menggunakan `cn()` utility untuk merge class names
- Komponen yang memerlukan state menggunakan `'use client'` directive
- TypeScript types lengkap untuk semua props
- Semua komponen dapat di-customize melalui className prop

## 🚀 Penggunaan

Import komponen dari index:

```tsx
import { Card, Badge, DataTable } from '@/components/ui';
```

Atau import langsung:

```tsx
import { Card } from '@/components/ui/Card';
```

