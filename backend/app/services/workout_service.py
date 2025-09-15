from app.schemas.workout import WorkoutResponse

def get_mock_workouts():
    return [
        WorkoutResponse(id=1, name="Push Ups", sets=3, reps=15, description="Chest & triceps"),
        WorkoutResponse(id=2, name="Squats", sets=3, reps=20, description="Leg strength"),
        WorkoutResponse(id=3, name="Pull Ups", sets=3, reps=10, description="Back & biceps"),
    ]
