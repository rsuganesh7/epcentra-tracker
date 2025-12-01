from typing import Optional

from pydantic import BaseModel


class PhaseCreateSchema(BaseModel):
    organizationId: Optional[str] = None
    name: str
    description: Optional[str] = None
    startWeek: Optional[int] = None
    endWeek: Optional[int] = None
    orderIndex: Optional[int] = 0


class PhaseUpdateSchema(BaseModel):
    organizationId: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    startWeek: Optional[int] = None
    endWeek: Optional[int] = None
    orderIndex: Optional[int] = None


class MilestoneCreateSchema(BaseModel):
    organizationId: Optional[str] = None
    phaseId: Optional[str] = None
    title: str
    description: Optional[str] = None
    week: Optional[int] = None


class MilestoneUpdateSchema(BaseModel):
    organizationId: Optional[str] = None
    phaseId: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    week: Optional[int] = None
