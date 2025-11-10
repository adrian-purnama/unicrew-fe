import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Star,
  Database,
  ChevronRight,
  ShieldCheck,
  EyeClosed,
  Briefcase,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/ApiHelper';

function CardLink({ to, title, subtitle, Icon }) {
  return (
    <Link
      to={to}
      className="
        group relative rounded-xl border border-gray bg-color-2 p-5
        hover:shadow-md hover:border-[rgb(var(--color-primary))]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]
        transition
        flex flex-col
      "
    >
      {/* icon */}
      <div className="
        mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg
        bg-primary-20 text-primary
        group-hover:scale-105 transition
      ">
        <Icon className="h-5 w-5" />
      </div>

      {/* content */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-color">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray">{subtitle}</p>}
      </div>

      {/* arrow */}
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
        Go
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>

      {/* subtle accent gradient */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-xl opacity-0
          group-hover:opacity-100 transition
        "
        style={{
          background:
            'linear-gradient(180deg, rgba(var(--color-primary),0.08), transparent 60%)',
        }}
      />
    </Link>
  );
}

export default function AdminHomePage() {
  const [downloadingDump, setDownloadingDump] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [downloadingCollection, setDownloadingCollection] = useState(false);

  const handleDownloadDump = async () => {
    try {
      setDownloadingDump(true);
      const response = await axiosInstance.get('/admin/db/dump', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/gzip',
      });
      const url = window.URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const link = document.createElement('a');
      link.href = url;
      link.download = `unicru-dump-${timestamp}.gz`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('MongoDB dump download started');
    } catch (error) {
      console.error('Failed to download MongoDB dump', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to download dump. Please try again.'
      );
    } finally {
      setDownloadingDump(false);
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setCollectionsLoading(true);
        const { data } = await axiosInstance.get('/admin/db/collections');
        const names = data?.collections || [];
        setCollections(names);
        setSelectedCollection(names[0] || '');
        setCollectionsError(null);
      } catch (error) {
        console.error('Failed to load collections', error);
        setCollectionsError(
          error.response?.data?.message ||
            'Unable to load collections. Please try again later.'
        );
        toast.error('Failed to load collections list.');
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleDownloadCollection = async () => {
    if (!selectedCollection) {
      toast.error('Select a collection before downloading.');
      return;
    }

    try {
      setDownloadingCollection(true);
      const response = await axiosInstance.get('/admin/db/export', {
        params: { collection: selectedCollection },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${selectedCollection}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);

      toast.success(
        `Exported ${selectedCollection} as Extended JSON for MongoDB Compass`
      );
    } catch (error) {
      console.error('Failed to download collection', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to export collection. Please try again.'
      );
    } finally {
      setDownloadingCollection(false);
    }
  };

  return (
    <>
      <div className='bg-color-1'>

      <main className="mx-auto max-w-6xl p-6 space-y-8 bg-color-1">
        {/* Header */}
        <header className="rounded-xl border border-gray bg-color-2 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-color">Admin</h1>
              <p className="mt-1 text-sm text-gray">
                Manage users, companies, content, and reference data.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray bg-color-1 px-3 py-2 text-sm text-color">
                <ShieldCheck className="h-4 w-4 text-primary" />
                You have admin access
              </span>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-gray bg-color-2 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-color">Database Tools</h2>
              <p className="mt-1 text-sm text-gray">
                Download a compressed MongoDB dump of the current database.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadDump}
              disabled={downloadingDump}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloadingDump ? 'Preparing...' : 'Download MongoDB Dump'}
            </button>
          </div>

          <div className="mt-6 space-y-3 rounded-lg border border-dashed border-gray bg-color-1/60 p-4">
            <div>
              <h3 className="text-sm font-semibold text-color">
                MongoDB Compass Export
              </h3>
              <p className="text-xs text-gray">
                Export a single collection as Extended JSON and import it using
                Compass&apos; &quot;Import Data&quot; feature.
              </p>
            </div>

            {collectionsLoading ? (
              <p className="text-sm text-gray">Loading collections…</p>
            ) : collectionsError ? (
              <p className="text-sm text-red-500">{collectionsError}</p>
            ) : (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <label className="w-full sm:w-64">
                  <span className="text-xs font-medium uppercase text-gray tracking-wide">
                    Collection
                  </span>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray bg-color-1 px-3 py-2 text-sm text-color focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {collections.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleDownloadCollection}
                  disabled={downloadingCollection || !selectedCollection}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary-20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {downloadingCollection ? 'Exporting…' : 'Export JSON for Compass'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Primary sections */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardLink
              to="/admin/users"
              title="Users"
              subtitle="Search, activate/deactivate, and remove user accounts."
              Icon={Users}
            />
            <CardLink
              to="/admin/companies"
              title="Companies"
              subtitle="Review company profiles, status, and ratings."
              Icon={Building2}
            />
            <CardLink
              to="/admin/reviews"
              title="Reviews"
              subtitle="Browse feedback and remove inappropriate reviews."
              Icon={Star}
            />
            <CardLink
              to="/admin/jobs"
              title="Job Management"
              subtitle="View job posts and manage applications with status tracking."
              Icon={Briefcase}
            />
            <CardLink
              to="/admin/entry"
              title="Data Entry"
              subtitle="Locations, skills, industries, study programs, universities."
              Icon={Database}
            />
            <CardLink
              to="/admin/resetpassword"
              title="Reset Password"
              subtitle="Run Indonesia Provinsi/Kabupaten/Kecamatan sync."
              Icon={EyeClosed}
            />
          </div>
        </section>

        {/* Tips / Shortcuts */}
        {/* <section className="rounded-xl border border-gray bg-color-2 p-5">
          <h2 className="text-base font-semibold text-color">Quick tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray">
            <li>
              • Use <span className="font-medium text-color">Reviews</span> to delete spam or abusive
              feedback.
            </li>
            <li>
              • In <span className="font-medium text-color">Data Entry</span>, you can edit names inline and search where available.
            </li>
            <li>
              • Location <span className="font-medium text-color">Sync</span> shows streaming progress and can be stopped anytime.
            </li>
          </ul>
        </section> */}
      </main>
      </div>

    </>
  );
}
