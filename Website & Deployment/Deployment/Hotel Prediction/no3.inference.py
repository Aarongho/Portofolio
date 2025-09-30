import pandas as pd
import pickle
import numpy as np

with open('xgb_model.pkl', 'rb') as file:
    model = pickle.load(file)

with open('encoder.pkl', 'rb') as file:
    encoder = pickle.load(file)

with open('scaler.pkl', 'rb') as file:
    scaler = pickle.load(file)

test_data = pd.DataFrame([{
    'no_of_adults': 3,
    'no_of_children': 1,
    'no_of_weekend_nights': 0,
    'no_of_week_nights': 3,
    'type_of_meal_plan': 'Meal Plan 1',
    'required_car_parking_space': 1,
    'room_type_reserved': 'Room_Type 2',
    'lead_time': 318,
    'arrival_year': 2024,
    'arrival_month': 3,
    'arrival_date': 10,
    'market_segment_type': 'Online',
    'repeated_guest': 1,
    'no_of_previous_cancellations': 4,
    'no_of_previous_bookings_not_canceled': 0,
    'avg_price_per_room': 672.0,
    'no_of_special_requests': 2
}])

categorical_columns = ['type_of_meal_plan', 'room_type_reserved', 'market_segment_type']
numerical_columns = [col for col in test_data.columns if col not in categorical_columns]

encoded_cats = encoder.transform(test_data[categorical_columns]) 
scaled_nums = scaler.transform(test_data[numerical_columns])

X_test_processed = np.hstack([scaled_nums, encoded_cats])

prediction = model.predict(X_test_processed)

print("Prediction:", "Canceled" if prediction[0] == 0 else "Not_Canceled")
