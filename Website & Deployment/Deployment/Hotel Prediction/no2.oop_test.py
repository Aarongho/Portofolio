import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, RobustScaler
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import pickle

class DataHandler:
    def __init__(self, input_df):
        self.input_df = input_df
        self.output_df = None

    def preprocess_data(self):
        self.input_df.drop(columns=["Booking_ID"], axis=1, inplace=True)
        self.input_df.drop_duplicates(inplace=True)
        self.input_df.replace(['NaN', 'nan', 'NULL', 'None', '?', ''], np.nan, inplace=True)
        self.output_df = self.input_df['booking_status']
        self.input_df.drop(columns=['booking_status'], inplace=True)

        combined_df = pd.concat([self.input_df, self.output_df], axis=1)  
        combined_df.dropna(inplace=True)  

        self.input_df = combined_df.drop(columns=['booking_status'])
        self.output_df = combined_df['booking_status']

        categorical_columns = ['type_of_meal_plan', 'room_type_reserved', 'market_segment_type']
        numerical_columns = self.input_df.select_dtypes(include=[np.number]).columns.tolist()

        self.encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        encoded_cats = self.encoder.fit_transform(self.input_df[categorical_columns])
        encoded_cat_df = pd.DataFrame(encoded_cats, columns=self.encoder.get_feature_names_out(categorical_columns))
        encoded_cat_df.index = self.input_df.index  # Align index

        self.scaler = RobustScaler()
        scaled_nums = self.scaler.fit_transform(self.input_df[numerical_columns])
        scaled_num_df = pd.DataFrame(scaled_nums, columns=numerical_columns)
        scaled_num_df.index = self.input_df.index  

        self.input_df = pd.concat([scaled_num_df, encoded_cat_df], axis=1)

        self.output_df = self.output_df.map({'Canceled': 0, 'Not_Canceled': 1})

        with open('encoder.pkl', 'wb') as f:
            pickle.dump(self.encoder, f)
        with open('scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)

    def get_processed_data(self):
        print(f"Processed input shape: {self.input_df.shape}")
        print(f"Processed output shape: {self.output_df.shape}")
        return self.input_df, self.output_df



class ModelHandler:
    def __init__(self, data_handler):
        self.data_handler = data_handler
        self.model = None
        self.x_train = None
        self.x_test = None
        self.y_train = None
        self.y_test = None

    def split_data(self):
        x, y = self.data_handler.get_processed_data()
        self.x_train, self.x_test, self.y_train, self.y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    def train_model(self):
        xgb_model = XGBClassifier(
            random_state=42, use_label_encoder=False, eval_metric='logloss',
            learning_rate=0.05, max_depth=6, n_estimators=500, subsample=0.8, colsample_bytree=1.0
        )
        xgb_model.fit(self.x_train, self.y_train)
        self.model = xgb_model

    def evaluate_model(self):
        predictions = self.model.predict(self.x_test)
        print(f"XGBoost Accuracy: {accuracy_score(self.y_test, predictions)}")
        print("Confusion Matrix:")
        print(confusion_matrix(self.y_test, predictions))
        print("\nXGBoost Classification Report:")
        print(classification_report(self.y_test, predictions))

    def save_model_to_file(self, filename):
        with open(filename, 'wb') as file:
            pickle.dump(self.model, file)
            print(f"Model saved to {filename}")
        

input_data = pd.read_csv("/Users/aaron/Documents/SEMESTER 4/Model Deployment/UTS/Dataset_B_hotel.csv")
data_handler = DataHandler(input_data)
data_handler.preprocess_data()  
model_handler = ModelHandler(data_handler)
model_handler.split_data()
model_handler.train_model()
model_handler.evaluate_model()
model_handler.save_model_to_file('xgb_model.pkl')



