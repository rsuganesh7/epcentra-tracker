from typing import Optional

from pydantic import BaseModel


class TeamCreateSchema(BaseModel):
    organizationId: Optional[str] = None
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    memberCount: Optional[int] = 0


class TeamUpdateSchema(BaseModel):
    organizationId: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    memberCount: Optional[int] = None
