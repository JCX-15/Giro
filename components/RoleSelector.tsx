"use client"

interface RoleSelectorProps {
    selectedRole: string
    onRoleChange: (role: string) => void
    availableRoles?: Array<{ value: string; label: string; icon: string }>
}

export function RoleSelector({ selectedRole, onRoleChange, availableRoles }: RoleSelectorProps) {
    const defaultRoles = [
        { value: "customer", label: "Cliente", icon: "👤" },
        { value: "laundry", label: "Lavandería", icon: "🏢" },
    ]

    const roles = availableRoles || defaultRoles

    return (
        <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4">¿Qué tipo de cuenta necesitas?</label>
        <div className="grid grid-cols-2 gap-4">
            {roles.map((option) => (
            <button
                key={option.value}
                type="button"
                onClick={() => onRoleChange(option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                selectedRole === option.value
                    ? "border-[#012840] bg-blue-50 shadow-lg"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
            >
                <div className="text-4xl mb-3">{option.icon}</div>
                <div className="font-semibold text-gray-700">{option.label}</div>
            </button>
            ))}
        </div>
        </div>
    )
}
