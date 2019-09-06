"""mblog URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path

import mainsite.views

urlpatterns = [
   # re_path('post/(\w+)$', showpost),
    path('', mainsite.views.lightView),
    path('gethislight/', mainsite.views.gethislight),
    path('getRealLight/', mainsite.views.getRealLight),

    # path('lightView/', mainsite.views.lightView),
    # path('gethislight/', mainsite.views.gethislight),
    # path('getRealLight/', mainsite.views.getRealLight),
    path('',mainsite.views.login),
    path('login/',mainsite.views.login),
    path('register/',mainsite.views.register)

]
