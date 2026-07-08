import librosa


def load_audio(path):

    audio, sr = librosa.load(
        path,
        sr=16000,
        mono=True
    )

    return audio, sr
