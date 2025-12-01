from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SubtaskSchema(BaseModel):
    id: str
    title: str
    status: str = Field(default="pending")


class TaskCreateSchema(BaseModel):
    organizationId: Optional[str] = None
    projectId: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: Optional[str] = Field(default="pending")
    priority: Optional[str] = Field(default="medium")
    phase: Optional[str] = None
    week: Optional[int] = None
    startDate: Optional[datetime | date] = None
    endDate: Optional[datetime | date] = None
    estimatedHours: Optional[float] = None
    actualHours: Optional[float] = None
    assignedTo: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    progress: Optional[int] = 0
    subtasks: Optional[List[SubtaskSchema]] = None
    blockedReason: Optional[str] = None
    completedAt: Optional[datetime] = None


class TaskUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    phase: Optional[str] = None
    week: Optional[int] = None
    startDate: Optional[datetime | date] = None
    endDate: Optional[datetime | date] = None
    estimatedHours: Optional[float] = None
    actualHours: Optional[float] = None
    assignedTo: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    progress: Optional[int] = None
    subtasks: Optional[List[SubtaskSchema]] = None
    blockedReason: Optional[str] = None
    completedAt: Optional[datetime] = None
