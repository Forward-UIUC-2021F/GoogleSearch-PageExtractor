import pickle

import numpy as np
import pandas as pd
import spacy
from sklearn.model_selection import train_test_split

from classifiers import general

nlp = spacy.load('en_core_web_md')
svm = pickle.load(open("./classifiers/svm/svmPickle_homepage_MengZhengData", 'rb'))

def classify(text):
    return general.getLabel_Spacy(svm, nlp, text)
