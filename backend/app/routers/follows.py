from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.deps import get_db, get_authenticated_user
from app.models.follows import FollowerProfile

router = APIRouter(prefix="/api/follows", tags=["follows"])


@router.post("/{user_id}")
async def follow_user(
    user_id: str,
    current_user: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    if current_user == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = (
        db.table("follows")
        .select("*")
        .eq("follower_id", current_user)
        .eq("following_id", user_id)
        .execute()
    )
    if existing.data:
        return {"status": "already_following"}

    db.table("follows").insert(
        {"follower_id": current_user, "following_id": user_id}
    ).execute()
    return {"status": "followed"}


@router.delete("/{user_id}")
async def unfollow_user(
    user_id: str,
    current_user: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    db.table("follows").delete().eq("follower_id", current_user).eq(
        "following_id", user_id
    ).execute()
    return {"status": "unfollowed"}


@router.get("/followers", response_model=list[FollowerProfile])
async def get_followers(
    current_user: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    result = (
        db.table("follows")
        .select("follower_id, profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)")
        .eq("following_id", current_user)
        .execute()
    )
    return [row["profiles"] for row in result.data or []]


@router.get("/following", response_model=list[FollowerProfile])
async def get_following(
    current_user: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    result = (
        db.table("follows")
        .select("following_id, profiles!follows_following_id_fkey(id, username, display_name, avatar_url)")
        .eq("follower_id", current_user)
        .execute()
    )
    return [row["profiles"] for row in result.data or []]


@router.get("/check/{user_id}")
async def check_following(
    user_id: str,
    current_user: str = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    result = (
        db.table("follows")
        .select("follower_id")
        .eq("follower_id", current_user)
        .eq("following_id", user_id)
        .execute()
    )
    return {"is_following": len(result.data or []) > 0}
