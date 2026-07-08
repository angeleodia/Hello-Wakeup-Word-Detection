import joblib

wake = joblib.load("models/wake_model.pkl")
nonwake = joblib.load("models/nonwake_model.pkl")

print("WAKE MODEL")
print(wake)

print("\nNONWAKE MODEL")
print(nonwake)
