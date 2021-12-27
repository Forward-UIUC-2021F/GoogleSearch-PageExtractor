import pickle

import numpy as np
import pandas as pd
import spacy
from sklearn.model_selection import train_test_split
from sklearn import ensemble
from sklearn.pipeline import Pipeline


# from classifiers import general
# from classifiers.baseClasses import SentenceJoiner, TF_IDF

from sklearn.feature_extraction.text import TfidfVectorizer

class SentenceJoiner():
    def __init__(self):
        pass 
    
    def fit(self, X, y):
        return self
    
    def transform(self, X, y=None):
        stringer = lambda arr: " ".join(arr)
        newX_train = list(map(stringer, X))
        return newX_train

class TF_IDF():
    def __init__(self):
        self.TFIDF = TfidfVectorizer(analyzer='word', token_pattern=r'\S+')
    
    def fit(self, X, y):
        self.TFIDF.fit(X)
        return self
    
    def transform(self, X, y=None):
        return self.TFIDF.transform(X)

class RandomForest_Meng():
    def __init__(self, dataset):
        pipe = Pipeline([('sentenceJoiner', SentenceJoiner()), ('TF_IDF', TF_IDF()), ('rf', ensemble.RandomForestClassifier())])
        self.clf = pipe
    
    def predict(self, X):
        return self.clf.predict(X)

def classify(text):
    # RandomForest_Meng.main() # Objects are being pickled with main_module as the top-level
    clf = pickle.load(open("./classifiers/rf_tfidf_mengdataset", 'rb'))
    rfMeng = RandomForest_Meng([])
    rfMeng.clf = clf
    y = int(rfMeng.clf.predict([text])[0])
    return general.getLabel(y)


    


