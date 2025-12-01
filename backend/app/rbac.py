from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional


Action = str
Resource = str


@dataclass(frozen=True)
class Permission:
    resource: Resource
    actions: List[Action]
    scope: Optional[str] = None  # all | team | own


# Mirror of src/types/rbac.ts
SYSTEM_ROLES: dict[str, List[Permission]] = {
    "owner": [
        Permission("organization", ["read", "update", "delete", "manage"]),
        Permission("project", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("task", ["create", "read", "update", "delete", "assign", "comment"], "all"),
        Permission("milestone", ["create", "read", "update", "delete"], "all"),
        Permission("team", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("user", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("workflow", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("status", ["create", "read", "update", "delete"], "all"),
        Permission("priority", ["create", "read", "update", "delete"], "all"),
        Permission("label", ["create", "read", "update", "delete"], "all"),
    ],
    "admin": [
        Permission("organization", ["read", "update"]),
        Permission("project", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("task", ["create", "read", "update", "delete", "assign", "comment"], "all"),
        Permission("milestone", ["create", "read", "update", "delete"], "all"),
        Permission("team", ["create", "read", "update", "delete", "manage"], "all"),
        Permission("user", ["read", "update", "manage"], "all"),
        Permission("workflow", ["create", "read", "update", "delete"], "all"),
    ],
    "manager": [
        Permission("project", ["create", "read", "update", "manage"], "team"),
        Permission("task", ["create", "read", "update", "delete", "assign", "comment"], "team"),
        Permission("milestone", ["create", "read", "update", "delete"], "team"),
        Permission("team", ["read", "update"], "team"),
        Permission("user", ["read"], "all"),
    ],
    "member": [
        Permission("project", ["read"], "team"),
        Permission("task", ["create", "read", "update", "comment"], "team"),
        Permission("task", ["update", "delete"], "own"),
        Permission("milestone", ["read"], "team"),
        Permission("team", ["read"], "team"),
        Permission("user", ["read"], "all"),
    ],
    "guest": [
        Permission("project", ["read"], "team"),
        Permission("task", ["read", "comment"], "team"),
        Permission("team", ["read"], "team"),
        Permission("user", ["read"], "all"),
    ],
}


def has_permission(
    role: str,
    member_team_ids: Iterable[str],
    resource: Resource,
    action: Action,
    *,
    created_by: Optional[str] = None,
    user_id: Optional[str] = None,
    context_team_ids: Optional[Iterable[str]] = None,
) -> bool:
    """Check permission using system roles and optional context for team/own scopes."""
    permissions = SYSTEM_ROLES.get(role, [])
    for perm in permissions:
        if perm.resource != resource:
            continue
        if action not in perm.actions:
            continue
        if not perm.scope or perm.scope == "all":
            return True
        if perm.scope == "team":
            if context_team_ids and set(member_team_ids) & set(context_team_ids):
                return True
        if perm.scope == "own" and created_by and user_id and created_by == user_id:
            return True
    return False
