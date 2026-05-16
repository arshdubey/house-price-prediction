**House Price Prediction Model**

**Description:**
- **Summary:** A simple linear regression model that predicts house prices using common features from a housing dataset.
- **Goal:** Demonstrate preprocessing, training, evaluation, and visualization with scikit-learn and Matplotlib.

**Files:**
- **code:** [code.py](code.py#L1) — main script that loads `dataset.csv`, trains a LinearRegression model, and shows predictions vs actuals.
- **data:** [dataset.csv](dataset.csv#L1) — CSV of house records used for training and evaluation.

**Requirements:**
- Python 3.8+
- pandas
- numpy
- matplotlib
- scikit-learn

**Install dependencies:**
```bash
pip install pandas numpy matplotlib scikit-learn
```

**Run:**
```bash
python code.py
```
- The script trains a linear regression model on the selected features and displays a scatter plot comparing actual and predicted prices.
- It prints the first 50 rows of actual vs predicted values to the console.

**Notes on the dataset and model:**
- The script uses these features: `sqft_living`, `bedrooms`, `bathrooms`, `grade`, `view`.
- Prices are scaled in the script as `price / 100000` for plotting and output clarity.
- Training/test split: 70% train, 30% test (`random_state=42`).

**Predicting a custom house:**
- `code.py` includes a placeholder `custom_house = np.array([[2000, 3, 2, 7, 0]])`.
- To get a prediction for this sample, add after model training:
```python
pred = model.predict(custom_house)
print("Predicted price (scaled):", pred)
```
- Multiply the returned value by `100000` to get the price in original units.

**Next steps / Improvements:**
- Add feature scaling and cross-validation.
- Try other models (Ridge, RandomForest) and compare metrics (MAE, RMSE).
- Add model persistence (joblib) and a small CLI or web API for serving predictions.

**License & Attribution:**
- This repository is provided as-is for learning and experimentation.

