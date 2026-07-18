import io
import pandas as pd
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List
from DB.models.User import User
router = APIRouter(prefix="/users", tags=["Users Management"])


@router.post("/upload-excel", status_code=status.HTTP_201_CREATED)
async def upload_users_excel(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was uploaded or filename is missing."
        )
   
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith('.xlsx') or filename_lower.endswith('.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file format. Please upload a valid Excel file (.xlsx or .xls)."
        )
    try: 
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        required_columns = ["phone_number", "name", "role","telegram_id","is_active"]
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Missing required column in Excel: '{col}'"
                )
        users_created = 0
        skipped_users = 0
        for index, row in df.iterrows():
            phone = str(row["phone_number"]).strip()
            name = str(row["name"]).strip()
            role = str(row["role"]).strip().lower()
            telegram_id =  str(row["telegram_id"])
            is_active = str(row["is_active"]).strip()
            if role not in ["patient", "therapist", "buddy", "admin"]:
              #  TODO 
                continue  # אם התפקיד לא חוקי, נדלג על השורה צריך להוסיף קריאה לאדמין שיעדכן 


            existing_user = await User.find_one(User.phone_number == phone)
            if existing_user:
                skipped_users += 1
                continue  # דילוג למשתמש הבא
            
            # יצירת אובייקט משתמש חדש
            new_user = User(
                phone_number=phone,
                name=name,
                role=role,
                telegram_id = telegram_id,
                is_active = is_active,
                is_approved=True,  # משתמשים שמועלים באקסל ע"י חברה מאושרים אוטומטית
            )
            
            # שמירה פיזית ב-MongoDB Atlas בענן
            await new_user.insert()
            users_created += 1
            
        return {
            "status": "success",
            "message": f"Successfully processed Excel file.",
            "inserted_count": users_created,
            "skipped_duplicate_count": skipped_users
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An error occurred while processing the excel file: {str(e)}"
        )