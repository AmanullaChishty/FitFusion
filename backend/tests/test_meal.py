from uuid import UUID
from datetime import date
from app.schemas.meal import MealCreate
from app.services import meal_service

test_meal = MealCreate(
    user_id=UUID("aa2aa513-2095-42e9-b7bf-b40cc29ef42d"),
    meal_type="breakfast",
    food_items=[{"item":"oats","qty":"50g"}],
    calories=300,
    protein_g=10,
    carbs_g=45,
    fats_g=5,
    date=date.today()
)

import asyncio

async def main():
    created = await meal_service.create_meal(test_meal)
    print(created)

asyncio.run(main())
