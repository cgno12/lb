# from django.template.loader import get_template
# from django.shortcuts import render
# from django.http import HttpResponse
# from django.shortcuts import redirect
# from datetime import datetime,timedelta
# from .models import Post
# from .models import LightData
# from django.db import connection
# from django.http import JsonResponse
# from django.core import serializers
# import json

# from . import  forms
# from . import models
# from django.contrib.auth.hashers import make_password
# from django.contrib.auth.hashers import check_password
# import re
# from Cryptodome import Random
# from Cryptodome.PublicKey import RSA
# from Cryptodome.Cipher import PKCS1_v1_5
# import base64

from django.template.loader import get_template
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import redirect
from datetime import datetime,timedelta
# from .models import Post
# from .models import LightData
from django.db import connection
from django.http import JsonResponse
from django.core import serializers
import json
#from . import  forms
#from . import models
from django.core import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import re
from Cryptodome import Random
from Cryptodome.PublicKey import RSA
from Cryptodome.Cipher import PKCS1_v1_5
import base64

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import math
from sklearn.neighbors import LocalOutlierFactor
from sklearn.linear_model import LinearRegression


def lightView(request):
        return render(request, 'light.html')

def my_custom_sql(strsql):
        with connection.cursor() as cursor:
                cursor.execute(strsql)
                row = cursor.fetchall()
        return row

def getlight(date8, isReal):
        if isReal == 0 :
                date_utc0 = date8 + timedelta(hours=-8)
                date_utc01 = date8 + timedelta(hours=16)
        elif isReal == 1:
                date_utc0 = date8 + timedelta(hours=-8, minutes=-2)
                date_utc01 = date8 + timedelta(hours=-8, minutes=-1) 
        else:
                date_utc0 = date8 + timedelta(hours=-10, minutes=-2)
                date_utc01 = date8 + timedelta(hours=-8, minutes=-1) 
                
        date = date_utc0.strftime("\'%Y-%m-%d %H:%M:%S\'")
        date1 = date_utc01.strftime("\'%Y-%m-%d %H:%M:%S\'")
        cls = []
        cl = {}
        cl["cl"] = []
        cl["id"] = 0                
        if isReal == 0:
                strsql = 'select * from His_Thunderstorm_Data_Tab_' + str(date_utc0.year) + ' WHERE BeginTime >=' + date + 'and BeginTime <' + date1 + 'ORDER BY ClusterRelate, ID'
                row = list(my_custom_sql(strsql))
                print(len(row))
                for r in row:
                        if cl["id"] != r[7]:
                                cls.append(cl)
                                cl = {}
                                cl["id"] = r[7]
                                cl["cl"] = []
                                cl["ts"] = str(r[1])[:-3]
                        p = {}
                        p["timeS"] = str(r[1])[:-3]
                        p["timeE"] = str(r[2])[:-3]
                        p["times"] = r[3]
                        p["lat"] = r[4]
                        p["lng"] = r[5]
                        p["border"] = r[6]
                        p["cluster"] = r[7]
                        cl["te"] = str(r[2])[:-3]
                        cl["cl"].append(p)
                cls.append(cl)
          
        if (date8.month > 9) or (date8.month < 6):
                strsql = 'select * from His_LightData_Tab_' + str(date8.year) + ' WHERE CollectTime >=' + date + 'and CollectTime <' + date1 + 'ORDER BY ID'  
        else:
                strsql = 'select * from His_LightData_Tab_' + str(date8.year) + '0' + str(date8.month) + ' WHERE CollectTime >=' + date + 'and CollectTime <' + date1 + 'ORDER BY ID' 
        row = list(my_custom_sql(strsql))
        point = []
        for r in row:
                p = {}
                p["time"] = str(r[1])[:-3]
                p["ic"] = r[3]
                p["rs"] = r[4]
                p["data"] = r[5]
                point.append(p) 
        ret = {}
        ret["cluster"] = cls
        ret["point"] = point
        #print(len(cls))
        return ret
       
def gethislight(request):
        date = request.GET.get('date')
        date_utc8 = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")       
        ret = getlight(date_utc8, 0)
        return HttpResponse(json.dumps(ret), content_type="application/json")

def getRealLight(request):
        date = request.GET.get('date')
        first = int(request.GET.get('first'))
        date_utc8 = datetime.strptime(date, "%Y-%m-%d %H:%M:%S") 
        if first:
                ret = getlight(date_utc8, 1)
        else:
                ret = getlight(date_utc8, 2)

        cluster = getThunderstorm(date_utc8)
        retdata = {}
        retdata['light'] = ret
        retdata['cluster'] = cluster
        return HttpResponse(json.dumps(retdata), content_type="application/json")
        
def login(request):
    if request.method == 'GET':
        username = request.session.get('form-group', None)
        if username is None:
            
            random_generator = Random.new().read
            rsa = RSA.generate(1024, random_generator)
            rsa_private_key = rsa.exportKey()
            rsa_public_key = rsa.publickey().exportKey()
            
            with open('my_private_rsa_key.pem', 'w+') as f:
                f.write(rsa_private_key.decode())
                f.close()
            return render(request, 'login.html', {'pub_key': rsa_public_key.decode()})
        

    if request.method == 'POST':
        username = request.POST.get('username')    
        password = request.POST.get('password')   
        with open('my_private_rsa_key.pem', 'r') as f:
            privkeystr = f.read().encode()
            f.close()
        
        privkey = RSA.importKey(privkeystr)
        cipher = PKCS1_v1_5.new(privkey)
        password = cipher.decrypt(base64.b64decode(password.encode()), 'error').decode()

        user = models.UserTab.objects.get(username=username)         

        if check_password(password,user.password):
                t=datetime.now()
                models.UserTab.objects.filter(username=username).update(status=1) 
                models.UserTab.objects.filter(username=username).update(logintime=t)
                print(username, password)
                return render(request,'light.html')
        else:
                message = '密码不正确！'
                return render(request, 'login.html', locals())    

def register(request):
    if request.method == 'POST':
        register_form = forms.Register_Form(request.POST)
        message = "请检查填写的内容！"
        if register_form.is_valid():
            username = register_form.cleaned_data.get('username')
            password1 = register_form.cleaned_data.get('password1')
            password2 = register_form.cleaned_data.get('password2')
            if checkio(password1)!=True:
                message="密码复杂度过低，请输入至少十位密码（包括数字，大小写字母)"
                return render(request,'register.html',locals())
            else:
                if password1 != password2:
                    message = '两次输入的密码不同！'
                    return render(request, 'register.html', locals())
                else:
                    same_name_user = models.UserTab.objects.filter(username=username)
                    if same_name_user:
                        message = '用户名已经存在'
                        return render(request, 'register.html', locals())

                new_user = models.UserTab()
                new_user.username = username
                new_user.password = make_password(password1)
                new_user.save()
                return render(request, 'login.html')
        else:
            return render(request, 'register.html', locals())
    register_form = forms.Register_Form()
    return render(request, 'register.html', locals())

def checkio(data):
        return True if re.search("^(?=.*\d)(?=.*[a-z]).*$",data)and len(data)>=5 else False

def lightPredict(df):
        weidu = df.ix[ : , 2]
        jingdu = df.ix[ : , 3]
        hebianhao = df.ix[ : , 1]
        weidu = np.asarray(weidu, dtype = np.float64)
        jingdu = np.asarray(jingdu, dtype = np.float64)
        m = list(set(hebianhao))
        if len(m) < 3:
                return None

        m.sort() 
        new_he_x =[]
        new_he_y =[]
        # j 为雷暴核索引
        for j in range(len(m)):
                #把经纬度作为两列存入矩阵
                y = weidu[hebianhao == m[j]]
                x = jingdu[hebianhao == m[j]]
                y = np.array([y])
                x = np.array([x])
                data = np.concatenate((y.T,x.T),axis=1)

                #调用LOF函数
                p,d=LOF(data)

                #处理后的雷暴核坐标
                new_he_x.append(np.mean(p[:,1]))
                new_he_y.append(np.mean(p[:,0]))
                p_line=Range(p)

        # #调用Range函数
        
        lines = []
        lines.append(p_line.tolist())

        x_in = np.asarray(new_he_x).reshape(-1, 1)
        y_in = np.asarray(new_he_y).reshape(-1, 1)

        for i in range(5):
                p_line_prd = Predict(x_in,y_in,p_line,i)
                lines.append(p_line_prd.tolist())
        return lines


def cal_distance(p1,p2):
        return math.sqrt(math.pow(np.abs(p1[0]-p2[0]),2) + math.pow(np.abs(p1[1]-p2[1]),2))
        
"""
LOF算法去除离群点
"""
def LOF(Data):
        model = LocalOutlierFactor(n_neighbors=10, contamination='auto',novelty=True)    #定义一个LOF模型，异常比例是10%
        model.fit(Data)
        z= model._predict(Data) #若样本点正常，返回1，不正常，返回-1
        index = z == 1
        P = Data[index,:] #剩余点
        P = np.array(list(set([tuple(t) for t in P])))
        D = np.array([z])
        return P,D

"""
计算两向量夹角(将在雷暴范围查找中使用)
"""     
def cal_angle(v1, v2):
        dx1 = v1[2] - v1[0]
        dy1 = v1[3] - v1[1]
        dx2 = v2[2] - v2[0]
        dy2 = v2[3] - v2[1]
        angle1 = math.atan2(dy1, dx1)
        angle1 = angle1 * 180/math.pi
        # print(angle1)
        angle2 = math.atan2(dy2, dx2)
        angle2 = angle2 * 180/math.pi
        # print(angle2)
        if angle1*angle2 >= 0:
            included_angle = abs(angle1-angle2)
        else:
            included_angle = abs(angle1) + abs(angle2)
            if included_angle > 180:
                included_angle = 360 - included_angle
        return included_angle
    
"""
雷暴覆盖范围查找
"""   
def Range(P):
        #查找起始点p0（保证y坐标最大的情况下，x坐标最小的点）
        y_max=max(P[:,0])
        index1 = P[:,0]==y_max
        p_ymax=P[index1,:]
        #(p_ymax)
        x_ymax=min(p_ymax[:,1])
        #print(x_ymax)

        index2 = p_ymax[:,1]==x_ymax
        p0=p_ymax[index2,:]
        P_line=p0
        flag1 = True
        p_next = p0

        index3 = np.zeros(len(P))
        for i in range(len(P)):
                index3[i] = any(P[i,:]!=p0[0])
        index3 = index3 == 1
        p_rest=P[index3,:]
        while(flag1):
                l=len(p_rest)
                angles=[]
                l_pline=len(P_line)
                for i in range(l):        
                        if(all(P_line[(l_pline-1):,:][0]==p0[0])): 
                                v_p0=[p0[:,1],p0[:,0],p0[:,1]+1,p0[:,0]]
                                v_pnext=[p0[:,1],p0[:,0],np.array([p_rest[i,1]]),np.array([p_rest[i,0]])]
                                angle=cal_angle(v_pnext,v_p0)
                                angles.append(angle)
                        else:
                                v_last=[P_line[l_pline-2,1],P_line[l_pline-2,0],P_line[l_pline-1,1],P_line[l_pline-1,0]]
                                v_next=[P_line[l_pline-1,1],P_line[l_pline-1,0],p_rest[i,1],p_rest[i,0]]
                                angle=cal_angle(v_next,v_last)
                                angles.append(angle)
                angles_array= np.asarray(angles)
                angle_min=min(angles)
                index4 = angles_array == angle_min
                p_next=p_rest[index4,:]
                P_line=np.concatenate((P_line,p_next))
                index5 = np.zeros(len(P))
                for i in range(len(P)):
                        index5[i] = any(P[i,:]!=p_next[0])
                index5 = index5 == 1        
                p_rest = P[index5,:]
                flag1 = any(p_next[0,:]!=p0[0,:])

        return P_line


# def Range(P):
#         #查找起始点p0（保证y坐标最大的情况下，x坐标最小的点）
#         y_max=max(P[:,0])
#         index1 = P[:,0]==y_max
#         p_ymax=P[index1,:]
#         x_ymax=min(p_ymax[:,1])
#         index2 = p_ymax[:,1]==x_ymax
#         p0=p_ymax[index2,:]
#         P_line=p0
#         flag1 = True
#         p_next = p0
        
#         index3 = np.zeros(len(P))
#         for i in range(len(P)):
#             index3[i] = any(P[i,:]!=p0[0])
#         index3 = index3 == 1
#         p_rest=P[index3,:]
#         while(flag1):
#             l=len(p_rest)
#             angles=[]
#             l_pline=len(P_line)
#             for i in range(l):        
#               if(all(P_line[(l_pline-1):,:][0]==p0[0])): 
#                   v_p0=[p0[:,1],p0[:,0],p0[:,1]+1,p0[:,0]]
#                   v_pnext=[p0[:,1],p0[:,0],np.array([p_rest[i,1]]),np.array([p_rest[i,0]])]
#                   angle=cal_angle(v_pnext,v_p0)
#                   angles.append(angle)
#               else:
#                   v_last=[P_line[l_pline-2,1],P_line[l_pline-2,0],P_line[l_pline-1,1],P_line[l_pline-1,0]]
#                   v_next=[P_line[l_pline-1,1],P_line[l_pline-1,0],p_rest[i,1],p_rest[i,0]]
#                   angle=cal_angle(v_next,v_last)
#                   angles.append(angle)
#             angles_array= np.asarray(angles)
#             angle_min=min(angles)
#             index4 = angles_array == angle_min
#             p_next=p_rest[index4,:]
#             #---------------------------------------------------------改--------------------------------------------------------
#             if len(p_next) > 1:
#                 distances = []
#                 for i in range(len(p_next)):
#                     distances.append(cal_distance(P_line[-1],p_next[i]))
#                 distances = np.asarray(distances)    
#                 p_next = p_next[distances == min(distances)]
#             P_line=np.concatenate((P_line,p_next))
#             index5 = np.zeros(len(P))
#             for i in range(len(P)):
#                 index5[i] = any(P[i,:]!=p_next[0])
#             index5 = index5 == 1        
#             p_rest=P[index5,:]
#             flag1=any(p_next[0,:]!=p0[0,:])
            
#         return P_line


"""
预测t时间后的雷暴核位置以及雷暴范围
"""       

# def Predict(x_in,y_in,P_line,t):
#         #对处理后的雷暴核进行一元线性拟合，得到雷暴核预测路径
#         lreg = LinearRegression()
#         lreg.fit(x_in, y_in)    
#         #------------------------------------------改------------------经度平均变化速度 
#         sum_v=0
#         for i in range (len(x_in)-1):
#             sum_v=sum_v+(x_in[i+1,0]-x_in[i,0])
#         if (len(x_in)-1)==0:
#             print('当前仅有一组数据')
#         else:
#             delta_x=sum_v/(len(x_in)-1)
#         #核坐标预测
#         x_prd = x_in[-1,0]+delta_x*t
#         y_in_ideal=lreg.predict(x_in[-1,0].reshape(1, -1))
#         y_prd = lreg.predict(x_prd.reshape(1, -1))
#         delta_y = y_prd-y_in_ideal
    
#         #雷暴覆盖范围预测
#         l_pline=np.size(P_line,0)
#         P_line_prd=np.zeros((l_pline,2))
#         for q in range(l_pline):
#             P_line_prd[q,1]=P_line[q,1]+delta_x*t
#             P_line_prd[q,0]=P_line[q,0]+delta_y*t
#         return P_line_prd

def Predict(x_in,y_in,P_line,t):
    #对处理后的雷暴核进行一元线性拟合，得到雷暴核预测路径
    lreg = LinearRegression()
    lreg.fit(x_in, y_in)    
    #经度变化速度/单位时间
    delta_x=x_in[-1,0]-x_in[-2,0]
    #核坐标预测
    x_prd = x_in[-1,0]+delta_x*t
    y_in_ideal=lreg.predict(x_in[-1,0].reshape(1, -1))
    y_prd = lreg.predict(x_prd.reshape(1, -1))
    delta_y = y_prd-y_in_ideal

    #雷暴覆盖范围预测
    l_pline=np.size(P_line,0)
    P_line_prd=np.zeros((l_pline,2))
    for q in range(l_pline):
        P_line_prd[q,1]=P_line[q,1]+delta_x*t
        P_line_prd[q,0]=P_line[q,0]+delta_y*t
    return P_line_prd

def getThunderstorm(date8):
        date_utc0 = date8 + timedelta(hours=-8, minutes=-8)
        date_utc01 = date8 + timedelta(hours=-8, minutes=-2)
        date = date_utc0.strftime("\'%Y-%m-%d %H:%M:%S\'")
        date1 = date_utc01.strftime("\'%Y-%m-%d %H:%M:%S\'")
        
        strsql = '''SELECT ClusterRelate,
                        STUFF((
                        SELECT ', ' +  CAST(ID AS VARCHAR(MAX))
                        FROM His_Thunderstorm_Data_Tab_2019
                        WHERE (ClusterRelate = Results.ClusterRelate)
                        FOR XML PATH ('')) ,1,2,'') AS IDS
                        FROM  His_Thunderstorm_Data_Tab_2019  AS Results '''
        #strsql2 = '''WHERE BeginTime >= ' 2019-07-23 22:27 ' AND BeginTime < ' 2019-07-23 22:30 '   GROUP BY ClusterRelate ORDER BY ClusterRelate'''

        strsql2 = 'WHERE EndTime >= ' + date + ' AND EndTime < ' + date1 + '   GROUP BY ClusterRelate ORDER BY ClusterRelate'
        strsql = strsql + strsql2
        row = list(my_custom_sql(strsql))
        clusters = []
        for r in row:
                if (date_utc0.month > 9) or (date_utc0.month < 6):
                        strsql = 'select * from His_Lightning_Data_Tab_' + str(date_utc0.year) + ' WHERE ThunderstormTabID in (' + r[1] +')'   
                else:
                        strsql = 'select * from His_Lightning_Data_Tab_' + str(date_utc0.year) + '0' + str(date_utc0.month) + ' WHERE ThunderstormTabID in (' + r[1] +')'

                df = pd.DataFrame(my_custom_sql(strsql))
                lines = lightPredict(df)
                if lines:
                        cluster = {}
                        cluster['id'] = r[0]
                        cluster['line'] = lines
                        clusters.append(cluster)

        return clusters

