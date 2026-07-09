from pydantic import BaseModel

class Student(BaseModel):
    name: str
    course: str
    marks: int
    attendance: int