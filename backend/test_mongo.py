from mongodb import interviews

result = interviews.insert_one({
    "student_name": "Shagun",
    "message": "Hello MongoDB!"
})

print("Inserted ID:", result.inserted_id)