import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from supabase import Client
from app.deps import get_db, get_authenticated_user
from app.config import get_settings

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 5MB")

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png"
    path = f"{user_id}/{uuid.uuid4()}.{ext}"

    content = await file.read()
    db.storage.from_("images").upload(path, content, {"content-type": file.content_type})

    settings = get_settings()
    url = f"{settings.supabase_url}/storage/v1/object/public/images/{path}"
    return {"url": url}
