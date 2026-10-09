from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import AssistantQueryRequest, AssistantQueryResponse
from ..security import get_current_user
from ..services.campus_assistant import answer_campus_query

router = APIRouter(prefix="/api/assistant", tags=["AI Campus Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
def query_campus_assistant(
    req: AssistantQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Role-aware natural language assistant for querying campus intelligence.
    """
    res = answer_campus_query(
        db=db,
        query=req.query,
        user_role=current_user.role,
        username=current_user.username
    )
    return res
