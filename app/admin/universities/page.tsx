"use client";

// Renders the admin universities page.
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { Building2, GraduationCap, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type University = {
  university_id: number;
  name: string;
  email_domain: string;
};

type Department = {
  department_id: number;
  name: string;
};

function normalizeDomain(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export default function UniversityAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | "">(
    "",
  );

  const [universityName, setUniversityName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingUniversity, setSavingUniversity] = useState(false);
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedUniversity = useMemo(
    () =>
      universities.find((u) => u.university_id === selectedUniversityId) ??
      null,
    [universities, selectedUniversityId],
  );
  const isUniversityAdmin = user?.role === "super_admin";
  const showUniversityAdminWarning = !authLoading && !isUniversityAdmin;
  const universityAdminWarning = "You are not the University Admin";

  async function loadUniversities() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/universities", {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to load universities.");
      }

      const nextUniversities = (data.universities ?? []) as University[];
      setUniversities(nextUniversities);
      setSelectedUniversityId((current) => {
        if (
          current &&
          nextUniversities.some((u) => u.university_id === current)
        ) {
          return current;
        }
        return nextUniversities[0]?.university_id ?? "";
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments(universityId: number) {
    setError("");

    try {
      const res = await fetch(
        `/api/admin/universities/${universityId}/departments`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to load departments.");
      }

      setDepartments((data.departments ?? []) as Department[]);
    } catch (err: unknown) {
      setDepartments([]);
      setError(err instanceof Error ? err.message : "Failed to load data.");
    }
  }

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (!selectedUniversityId) {
      setDepartments([]);
      return;
    }

    loadDepartments(selectedUniversityId);
  }, [selectedUniversityId]);

  async function handleCreateUniversity() {
    const name = universityName.trim();
    const domain = normalizeDomain(emailDomain);

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!name || !domain) {
      setError("University name and expected email domain are required.");
      return;
    }

    if (!domain.includes(".")) {
      setError("Use a full email domain, for example @students.liu.edu.lb.");
      return;
    }

    setSavingUniversity(true);
    try {
      const res = await fetch("/api/admin/universities", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailDomain: domain }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to save university.");
      }

      const university = data.university as University;
      setUniversities((prev) => {
        const exists = prev.some(
          (u) => u.university_id === university.university_id,
        );
        if (exists) {
          return prev.map((u) =>
            u.university_id === university.university_id ? university : u,
          );
        }
        return [...prev, university].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });
      setSelectedUniversityId(university.university_id);
      setUniversityName("");
      setEmailDomain("");
      setMessage(`${university.name} is ready with @${university.email_domain}.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save university.",
      );
    } finally {
      setSavingUniversity(false);
    }
  }

  async function handleCreateDepartment() {
    const name = departmentName.trim();

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId) {
      setError("Select a university first.");
      return;
    }

    if (!name) {
      setError("Department name is required.");
      return;
    }

    setSavingDepartment(true);
    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to save department.");
      }

      const department = data.department as Department;
      setDepartments((prev) => {
        const exists = prev.some(
          (d) => d.department_id === department.department_id,
        );
        if (exists) {
          return prev.map((d) =>
            d.department_id === department.department_id ? department : d,
          );
        }
        return [...prev, department].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });
      setDepartmentName("");
      setMessage(`${department.name} was added to ${selectedUniversity?.name}.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save department.",
      );
    } finally {
      setSavingDepartment(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            University Setup
          </h1>
          <p className="text-sm text-gray-500">
            Add universities, expected student email domains, and departments.
          </p>
        </div>
        <Button
          variant="elevated"
          onClick={loadUniversities}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {(error || message) && (
        <div
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {showUniversityAdminWarning && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are not the University Admin. Only the University Admin can add
          universities and departments.
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              University
            </h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="University name"
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            />
            <input
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              placeholder="@students.liu.edu.lb"
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleCreateUniversity}
              disabled={savingUniversity || authLoading}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {savingUniversity ? "Saving..." : "Save University"}
            </Button>
          </div>

          <div className="mt-5">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Active university
            </label>
            <select
              value={selectedUniversityId}
              onChange={(e) =>
                setSelectedUniversityId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5]"
            >
              <option value="">Select university</option>
              {universities.map((university) => (
                <option
                  key={university.university_id}
                  value={university.university_id}
                >
                  {university.name}
                </option>
              ))}
            </select>
            {selectedUniversity && (
              <p className="mt-2 text-xs text-gray-500">
                Registration email domain:{" "}
                <span className="font-medium text-[#6155F5]">
                  @{selectedUniversity.email_domain}
                </span>
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Departments
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Department name"
              disabled={!selectedUniversityId}
              className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30 disabled:bg-gray-50"
            />
            <Button
              onClick={handleCreateDepartment}
              disabled={!selectedUniversityId || savingDepartment || authLoading}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {savingDepartment ? "Saving..." : "Add"}
            </Button>
          </div>

          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-gray-100">
            {departments.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                No departments yet.
              </p>
            ) : (
              departments.map((department) => (
                <div
                  key={department.department_id}
                  className="border-b border-gray-100 px-3 py-2 text-sm text-gray-700 last:border-b-0"
                >
                  {department.name}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
