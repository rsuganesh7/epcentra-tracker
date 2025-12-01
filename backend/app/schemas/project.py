from typing import Optional

from pydantic import BaseModel


class ProjectCreateSchema(BaseModel):
    organizationId: str
    name: str
    key: str
    description: Optional[str] = None
    visibility: Optional[str] = "organization"
    status: Optional[str] = "active"


class ProjectUpdateSchema(BaseModel):
    organizationId: Optional[str] = None
    name: Optional[str] = None
    key: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
