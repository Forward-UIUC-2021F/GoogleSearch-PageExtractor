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