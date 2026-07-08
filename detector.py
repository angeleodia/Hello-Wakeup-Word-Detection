import joblib

from app.mfcc import extract_mfcc_chunks


class WakeDetector:

    def __init__(self):

        self.wake_model = joblib.load(
            "models/wake_model.pkl"
        )

        self.nonwake_model = joblib.load(
            "models/nonwake_model.pkl"
        )

        self.threshold = joblib.load(
            "models/best_threshold.pkl"
        )


    def predict(self, audio):

        chunks = extract_mfcc_chunks(audio)


        if len(chunks) == 0:

            return {
                "prediction": "no_audio",
                "wake": False,
                "wake_score": 0,
                "nonwake_score": 0
            }


        wake_scores = []
        nonwake_scores = []
        llrs = []


        for mfcc in chunks:

            ws = self.wake_model.score(mfcc)

            ns = self.nonwake_model.score(mfcc)


            wake_scores.append(ws)

            nonwake_scores.append(ns)

            llrs.append(ws - ns)



        wake_score = sum(wake_scores) / len(wake_scores)

        nonwake_score = sum(nonwake_scores) / len(nonwake_scores)

        llr = sum(llrs) / len(llrs)

        print("WAKE SCORE:", wake_score)
        print("NONWAKE SCORE:", nonwake_score)
        print("LLR:", llr)
        print("THRESHOLD:", self.threshold)



        detected = llr < 100



        return {

            "prediction":
                "wake_word" if detected else "non_wake_word",

            "wake":
                bool(detected),

            "wake_score":
                round(wake_score,4),

            "nonwake_score":
                round(nonwake_score,4),

            "llr":
                round(llr,4),

            "threshold":
                round(self.threshold,4)
        }
