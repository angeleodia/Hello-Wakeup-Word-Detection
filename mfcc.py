import librosa
import numpy as np


def extract_mfcc_chunks(audio_path, sr=16000, chunk_sec=1.0):

    y, _ = librosa.load(
        audio_path,
        sr=sr
    )

    chunk_len = int(sr * chunk_sec)

    chunks = []


    for start in range(0, len(y), chunk_len):

        chunk = y[start:start + chunk_len]


        if len(chunk) < chunk_len:
            continue


        mfcc = librosa.feature.mfcc(
            y=chunk,
            sr=sr,
            n_mfcc=13,
            n_fft=400,
            hop_length=160,
            win_length=400
        )


        chunks.append(mfcc.T)


    return chunks
