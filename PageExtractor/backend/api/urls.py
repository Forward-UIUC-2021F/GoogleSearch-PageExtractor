from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('csrf', views.csrf),
    path('ping', views.ping),
    path('getWebsite', views.getWebsite, name='getWebsite'),
    path('updateLabel', views.updateLabel, name='updateLabel')
]