from pymongo import MongoClient
mongo_client = MongoClient("mongodb://127.0.0.1:27017/")
mongo_db = mongo_client.ForwardData_PageExtractor

# print(mongo_db.entities.find_one())
# mongo_db.entities.replace_one({'text': "test"}, {'text': "test", 'label': "new val"}, upsert=True)

# TODO: fix the duplicate insert update issue if user overwrites stuff

#can be useful for testing with input -> this function is for the old model I had, new models are written so the feature space transformation happens internally
def getLabel_Spacy(clf, nlp, sentence):
    labels = {0: "Other", 1 : "Education", 2 : "Biography", 3 : "Research Interest", 4 : "Award", 5 : "Publication"}
    vect = nlp(sentence).vector
    y = int(clf.predict([vect])[0])
    return labels[y]

def getLabel(y):
    labels = {0: "Other", 1 : "Education", 2 : "Biography", 3 : "Research Interest", 4 : "Award", 5 : "Publication"}
    return labels[y]

DB_ENV = 'COLLECT'
def updateLabel_mongo(text, label, xpath, url):
    if DB_ENV == 'TEST':
        mongo_db.entities.update({'text': text}, {'label': label, 'text': text, 'xpath': xpath, 'url': url}, upsert=True)
    elif DB_ENV == 'COLLECT':
        mongo_db.entitiesFall21.update({'text': text}, {'label': label, 'text': text, 'xpath': xpath, 'url': url}, upsert=True)

'''
    Database Structure:
    db.entities.insert({text: "test", label: "test"})
        Mongo DB
        {
            text : "..."
            label : "..."
            xpath : "..."
        }
'''