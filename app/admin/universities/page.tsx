"use client";

// Renders the admin universities, departments, and majors setup page.
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import {
  Building2,
  Check,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type University = {
  university_id: number;
  name: string;
  email_domain: string;
  description?: string | null;
};

type Department = {
  department_id: number;
  name: string;
};

type Major = {
  major_id: number;
  name: string;
};

function normalizeDomain(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function sortedByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export default function UniversityAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | "">(
    "",
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    "",
  );

  const [universityName, setUniversityName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [universityDescription, setUniversityDescription] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [majorName, setMajorName] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(
    null,
  );
  const [editingDepartmentName, setEditingDepartmentName] = useState("");
  const [editingMajorId, setEditingMajorId] = useState<number | null>(null);
  const [editingMajorName, setEditingMajorName] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [savingUniversity, setSavingUniversity] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [savingMajor, setSavingMajor] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedUniversity = useMemo(
    () =>
      universities.find((u) => u.university_id === selectedUniversityId) ??
      null,
    [universities, selectedUniversityId],
  );

  const selectedDepartment = useMemo(
    () =>
      departments.find((d) => d.department_id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
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
    setLoadingDepartments(true);
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

      const nextDepartments = (data.departments ?? []) as Department[];
      setDepartments(nextDepartments);
      setSelectedDepartmentId((current) => {
        if (
          current &&
          nextDepartments.some((d) => d.department_id === current)
        ) {
          return current;
        }
        return "";
      });
    } catch (err: unknown) {
      setDepartments([]);
      setSelectedDepartmentId("");
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function loadMajors(universityId: number, departmentId: number) {
    setLoadingMajors(true);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/universities/${universityId}/departments/${departmentId}/majors`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to load majors.");
      }

      setMajors((data.majors ?? []) as Major[]);
    } catch (err: unknown) {
      setMajors([]);
      setError(err instanceof Error ? err.message : "Failed to load majors.");
    } finally {
      setLoadingMajors(false);
    }
  }

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    setDepartments([]);
    setMajors([]);
    setSelectedDepartmentId("");
    setDepartmentName("");
    setMajorName("");
    setEditingDepartmentId(null);
    setEditingMajorId(null);

    if (!selectedUniversityId) return;

    loadDepartments(selectedUniversityId);
  }, [selectedUniversityId]);

  useEffect(() => {
    setUniversityDescription(selectedUniversity?.description ?? "");
  }, [selectedUniversity]);

  useEffect(() => {
    setMajors([]);
    setMajorName("");
    setEditingMajorId(null);

    if (!selectedUniversityId || !selectedDepartmentId) return;

    loadMajors(selectedUniversityId, selectedDepartmentId);
  }, [selectedDepartmentId, selectedUniversityId]);

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
          return sortedByName(
            prev.map((u) =>
              u.university_id === university.university_id ? university : u,
            ),
          );
        }
        return sortedByName([...prev, university]);
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
          return sortedByName(
            prev.map((d) =>
              d.department_id === department.department_id ? department : d,
            ),
          );
        }
        return sortedByName([...prev, department]);
      });
      setSelectedDepartmentId(department.department_id);
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

  async function handleUpdateUniversityDescription() {
    const description = universityDescription.trim();

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

    if (description.length > 5000) {
      setError("Description is too long.");
      return;
    }

    setSavingDescription(true);
    try {
      const res = await fetch("/api/admin/universities", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_id: selectedUniversityId,
          description,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to save description.");
      }

      const university = data.university as University;
      setUniversities((prev) =>
        sortedByName(
          prev.map((item) =>
            item.university_id === university.university_id
              ? university
              : item,
          ),
        ),
      );
      setMessage(`${university.name} description was updated.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save description.",
      );
    } finally {
      setSavingDescription(false);
    }
  }

  async function handleUpdateDepartment(departmentId: number) {
    const name = editingDepartmentName.trim();

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId || !name) {
      setError("Select a university and enter a department name.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department_id: departmentId, name }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to update department.");
      }

      const department = data.department as Department;
      setDepartments((prev) =>
        sortedByName(
          prev.map((item) =>
            item.department_id === department.department_id ? department : item,
          ),
        ),
      );
      setEditingDepartmentId(null);
      setEditingDepartmentName("");
      setMessage(`${department.name} was updated.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update department.",
      );
    }
  }

  async function handleDeleteDepartment(department: Department) {
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

    const confirmed = window.confirm(
      `Delete ${department.name}? Courses and reviews will stay saved, but the department and its majors will be hidden.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department_id: department.department_id }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to delete department.");
      }

      setDepartments((prev) =>
        prev.filter((item) => item.department_id !== department.department_id),
      );
      if (selectedDepartmentId === department.department_id) {
        setSelectedDepartmentId("");
        setMajors([]);
      }
      setMessage(`${department.name} was deleted.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete department.",
      );
    }
  }

  async function handleCreateMajor() {
    const name = majorName.trim();

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId || !selectedDepartmentId) {
      setError("Select a university and department first.");
      return;
    }

    if (!name) {
      setError("Major name is required.");
      return;
    }

    setSavingMajor(true);
    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments/${selectedDepartmentId}/majors`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to save major.");
      }

      const major = data.major as Major;
      setMajors((prev) => {
        const exists = prev.some((item) => item.major_id === major.major_id);
        if (exists) {
          return sortedByName(
            prev.map((item) =>
              item.major_id === major.major_id ? major : item,
            ),
          );
        }
        return sortedByName([...prev, major]);
      });
      setMajorName("");
      setMessage(`${major.name} was added to ${selectedDepartment?.name}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save major.");
    } finally {
      setSavingMajor(false);
    }
  }

  async function handleUpdateMajor(majorId: number) {
    const name = editingMajorName.trim();

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId || !selectedDepartmentId || !name) {
      setError("Select a department and enter a major name.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments/${selectedDepartmentId}/majors`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ major_id: majorId, name }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to update major.");
      }

      const major = data.major as Major;
      setMajors((prev) =>
        sortedByName(
          prev.map((item) => (item.major_id === major.major_id ? major : item)),
        ),
      );
      setEditingMajorId(null);
      setEditingMajorName("");
      setMessage(`${major.name} was updated.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update major.");
    }
  }

  async function handleDeleteMajor(major: Major) {
    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId || !selectedDepartmentId) {
      setError("Select a department first.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${major.name}? Courses and reviews will stay saved, but this major's roadmaps will be hidden.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/universities/${selectedUniversityId}/departments/${selectedDepartmentId}/majors`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ major_id: major.major_id }),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to delete major.");
      }

      setMajors((prev) =>
        prev.filter((item) => item.major_id !== major.major_id),
      );
      setMessage(`${major.name} was deleted.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete major.");
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
            Add universities, expected student email domains, departments, and
            majors.
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
          You are not the University Admin. Only the University Admin can add,
          edit, or delete universities, departments, and majors.
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              University
            </h2>
          </div>

          <div className="mt-4 grid gap-3">
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

          {selectedUniversity && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                University description
              </label>
              <textarea
                value={universityDescription}
                onChange={(e) => setUniversityDescription(e.target.value)}
                rows={7}
                placeholder="Write the university description that should appear on the public University page..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  {universityDescription.trim().length}/5000 characters
                </p>
                <Button
                  onClick={handleUpdateUniversityDescription}
                  disabled={savingDescription || authLoading}
                >
                  {savingDescription ? "Saving..." : "Save Description"}
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Departments
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
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

          <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-gray-100">
            {loadingDepartments ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                Loading departments...
              </p>
            ) : departments.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                No departments yet.
              </p>
            ) : (
              departments.map((department) => {
                const isSelected =
                  department.department_id === selectedDepartmentId;
                const isEditing =
                  editingDepartmentId === department.department_id;

                return (
                  <div
                    key={department.department_id}
                    className={`border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 ${
                      isSelected ? "bg-[#EEF2FF]" : "bg-white"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingDepartmentName}
                          onChange={(e) =>
                            setEditingDepartmentName(e.target.value)
                          }
                          className="h-8 min-w-0 flex-1 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-[#6155F5]"
                        />
                        <button
                          onClick={() =>
                            handleUpdateDepartment(department.department_id)
                          }
                          className="rounded-md p-1.5 text-green-600 transition hover:bg-green-50"
                          aria-label="Save department"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDepartmentId(null);
                            setEditingDepartmentName("");
                          }}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100"
                          aria-label="Cancel department edit"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDepartmentId(department.department_id)
                          }
                          className="min-w-0 flex-1 truncate text-left font-medium text-gray-700"
                        >
                          {department.name}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDepartmentId(department.department_id);
                            setEditingDepartmentName(department.name);
                          }}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label="Edit department"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department)}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete department"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">Majors</h2>
          </div>

          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            {selectedDepartment
              ? `Selected department: ${selectedDepartment.name}`
              : "Choose a department to add or manage majors."}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
            <input
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              placeholder="Major name"
              disabled={!selectedDepartmentId}
              className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30 disabled:bg-gray-50"
            />
            <Button
              onClick={handleCreateMajor}
              disabled={!selectedDepartmentId || savingMajor || authLoading}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {savingMajor ? "Saving..." : "Add Major"}
            </Button>
          </div>

          <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-gray-100">
            {!selectedDepartmentId ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                Select a department first.
              </p>
            ) : loadingMajors ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                Loading majors...
              </p>
            ) : majors.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                No majors yet.
              </p>
            ) : (
              majors.map((major) => {
                const isEditing = editingMajorId === major.major_id;

                return (
                  <div
                    key={major.major_id}
                    className="border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingMajorName}
                          onChange={(e) => setEditingMajorName(e.target.value)}
                          className="h-8 min-w-0 flex-1 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-[#6155F5]"
                        />
                        <button
                          onClick={() => handleUpdateMajor(major.major_id)}
                          className="rounded-md p-1.5 text-green-600 transition hover:bg-green-50"
                          aria-label="Save major"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMajorId(null);
                            setEditingMajorName("");
                          }}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100"
                          aria-label="Cancel major edit"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-medium text-gray-700">
                          {major.name}
                        </span>
                        <button
                          onClick={() => {
                            setEditingMajorId(major.major_id);
                            setEditingMajorName(major.name);
                          }}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label="Edit major"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMajor(major)}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete major"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
