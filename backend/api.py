from fastapi import FastAPI
from pydantic import BaseModel

app= FastAPI()
# kyunki post method k liye hme body m data pass krna h and we cant pass data in definetion or as parametters of get method )we have to make this class becoz we want to get the data from the user in a structured way and we can use this class to validate the data and also to convert the data into a python object
class Student(BaseModel): 
    name:str
    age:int
    course: str
    
@app.get("/predict")
def predict_model(age:int,gender:str):
    if age<15 or gender=='f' :
        return{"survived":1}
    else:
        return{"survived":0}

@app.post("/student")
def creat_student(student: Student):
    return {
        "message":"student created successfully",
        "student": student
    }

