from django.http.response import JsonResponse, HttpResponse
from django.shortcuts import render
from django.http import HttpResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

import json
import requests

from urllib.parse import urlparse
from bs4 import BeautifulSoup as Soup

import lxml
from lxml.html.clean import Cleaner
from lxml import etree
from io import StringIO


from classifiers.svm_spacy import classify as svmSpacyClassify
from classifiers.rf_tfidf import classify as rfTFIDF


from classifiers.general import updateLabel_mongo

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

def ping(request):
    return JsonResponse({'result': 'OK'})

@csrf_exempt
def getWebsite(request):
    # https://webdesign.tutsplus.com/articles/quick-tip-set-relative-urls-with-the-base-tag--cms-21399
    body_unicode = request.body
    body = json.loads(body_unicode)

    # page = requests.get(body["url"]).text

    url = body["url"]
    classifier = body["classifier"]

    # get soup 
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
    #this header is specific to me, but it will work for anyone. some websites will block the GET request if this header is not present
    website = requests.get(url, headers=headers).content.decode()
    

    soup = Soup(website, features="lxml")    

    rawHTML, tree, contents = downloadRawHTML(soup, url)
    xpaths, conceptTerms = parseAndLabel(tree, classifier) #concept terms also contains the cleaned text
    return JsonResponse({"rawHTML": contents, "conceptTerms": conceptTerms, "xpaths" : xpaths})

def downloadRawHTML(soup, url):
    # dynamic website code from Aziz: 
    
    head = soup.find('head')
    base = soup.new_tag('base')
    base_url ='http://'+ urlparse(url).netloc
    base['href'] = base_url
    head.insert(1, base)
    contents = str(soup)
    # return contents

    cleaner = Cleaner()
    cleaner.remove_unknown_tags = False
    cleaner.javascript = True
    cleaner.style = True 
    cleaner.kill_tags = ['button']

    f = StringIO(contents)
    tree = lxml.html.parse(f)
    # tree = cleaner.clean_html(tree)

    # doc = tree.getroot()
    # doc.make_links_absolute(url)

    html = etree.tostring(tree).decode("utf-8")

    return html, tree, contents

def parseAndLabel(tree, classifier):
    # lxml parsing
    find_text = etree.XPath("//text()")
    
    classified = []
    xpaths = []
    for text in find_text(tree):
        rawText = text
        xpath = tree.getpath( text.getparent())

        cleaned = rawText.strip() 
        if cleaned != '\n' and cleaned != '':
            label = classifyConceptTerm(cleaned, classifier)
            classified.append((cleaned, label))
            xpaths.append(xpath)
        
    return xpaths, classified

def classifyConceptTerm(concept_term, classifier):
    
    classifier = int(classifier)
    
    classifierMap = {
        0 : rfTFIDF,
        1 : svmSpacyClassify,
        2 : svmSpacyClassify,
        3 : svmSpacyClassify
    }
    return classifierMap[classifier](concept_term)


@csrf_exempt
def updateLabel(request):
    body_unicode = request.body
    body = json.loads(body_unicode)
    text = body["text"]
    label = body["label"]
    xpath = body["xpath"]
    url = body["url"]

    updateLabel_mongo(text, label, xpath, url)

    # todo, error catching and stuff
    return HttpResponse(status=200)