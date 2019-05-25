using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Diagnostics;
public partial class _Default : System.Web.UI.Page
{
    //string ip = "127.0.0.1";
    //string ip = "139.5.203.26";
    string ip = "120.76.200.182";
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        for (int i = 0; i < 1; i++)
        {
            string act = "reg";
            string test = "55";
            string accountname = "gtjsa" + test;
            //string nickname = Server.UrlEncode("中文");
            string nickname = "gtjsa" + test;
            string pwd = "gtjsa"+  test + test ;
            string time = GetTimeStamp();
            string key = "42dfcb34fb02d8cd";
            string sing = act + accountname + nickname + pwd + time + key;
            string md5sing = GetMd5Str32(act + accountname + nickname + pwd + time + key);

            string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&nickname={3}&pwd={4}&time={5}&sign={6}&goldnum=0", ip, act, accountname, nickname, pwd, time, md5sing);

            try
            {
                HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
                webRequest2.Method = "GET";                                          //请求方式是POST
                HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
                StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Unicode);
                string text2 = sr2.ReadToEnd();
                HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");

            }
            catch (Exception ex)
            {
                //HttpContext.Current.Response.Write("ex:" + ex.ToString());
            }
        }
    }


    protected void Button2_Click(object sender, EventArgs e)
    {
        string act = "scoreedit";
        string accountname = "abc123";
        string goldnum = "1000";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + goldnum + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&goldnum={3}&time={4}&sign={5}", ip, act, accountname, goldnum, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }
    protected void Button3_Click(object sender, EventArgs e)
    {
        string act = "recordquery";
        //1捕鸟,2连线机
        string gameid = "1";
        string recordBeginTime = System.DateTime.Now.ToString("yyyy-MM-dd");
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string lineCount = "10";
        string sing = act + gameid + lineCount + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&gameid={2}&linecount={3}&time={4}&sign={5}", ip, act, gameid, lineCount, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }
    protected void Button4_Click(object sender, EventArgs e)
    {
        string act = "pwdreset";
        string accountname = "gtjsa55";
        string pwd = "gtjsa55555";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + pwd + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&pwd={3}&time={4}&sign={5}", ip, act, accountname, pwd, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }
    protected void Button5_Click(object sender, EventArgs e)
    {
        string act = "scorequery";
        string accountname = "abc123";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&time={3}&sign={4}", ip, act, accountname, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }

    protected void Button11_Click(object sender, EventArgs e)
    {
        string act = "mark";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string gameid = "2";
        string pkid = "240507";
        string sing = act + gameid + pkid + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&gameid={2}&pkid={3}&time={4}&sign={5}", ip, act, gameid, pkid, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }

    protected void Button12_Click(object sender, EventArgs e)
    {
        string strResult = "";
        try
        {
             string url = String.Format("act=sendCoinServer&sendUserId={0}&sendCoin={1}", TextBox1.Text,TextBox2.Text); ;
            
             string formUrl = String.Format("http://{0}:3000/gmManage", ip);
             string formData = url;                               //提交的参数

             //注意提交的编码 这边是需要改变的 这边默认的是Default：系统当前编码
             byte[] postData = Encoding.UTF8.GetBytes(formData);

             // 设置提交的相关参数 
             HttpWebRequest request = WebRequest.Create(formUrl) as HttpWebRequest;
             Encoding myEncoding = Encoding.UTF8;
             request.Method = "POST";
             request.KeepAlive = false;
             request.AllowAutoRedirect = true;
             request.ContentType = "application/x-www-form-urlencoded";
             request.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR  3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)";
             request.ContentLength = postData.Length;

             // 提交请求数据 
             System.IO.Stream outputStream = request.GetRequestStream();
             outputStream.Write(postData, 0, postData.Length);
             outputStream.Close();

             HttpWebResponse response;
             Stream responseStream;
             StreamReader reader;
             string srcString;
             response = request.GetResponse() as HttpWebResponse;
             responseStream = response.GetResponseStream();
             reader = new System.IO.StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
             srcString = reader.ReadToEnd();
             string result = srcString;   //返回值赋值
             Label5.Text = result;
             //var mJObj = JArray.Parse(result);
             //mJObj["Result"]
             //Label5.Text = mJObj["msg"].ToString();

             reader.Close();
        }
        catch (Exception exp)
        {
            strResult = "错误：" + exp.Message;
        }
    }

    public static string GetTimeStamp()
    {
        TimeSpan ts = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0);
        return Convert.ToInt64(ts.TotalSeconds).ToString();
    }

    static string GetMd5Str32(string str) //MD5摘要算法
    {

        MD5CryptoServiceProvider md5Hasher = new MD5CryptoServiceProvider();

        // Convert the input string to a byte array and compute the hash.  

        char[] temp = str.ToCharArray();

        byte[] buf = new byte[temp.Length];

        for (int i = 0; i < temp.Length; i++)
        {

            buf[i] = (byte)temp[i];

        }

        byte[] data = md5Hasher.ComputeHash(buf);

        // Create a new Stringbuilder to collect the bytes  

        // and create a string.  

        StringBuilder sBuilder = new StringBuilder();

        // Loop through each byte of the hashed data   

        // and format each one as a hexadecimal string.  

        for (int i = 0; i < data.Length; i++)
        {

            sBuilder.Append(data[i].ToString("x2"));

        }

        // Return the hexadecimal string.  

        return sBuilder.ToString();

    }
    protected void Button6_Click(object sender, EventArgs e)
    {
        string strResult = "";
        try
        {
            string url = "act=GetuserListOnline";
//             url = url + "p=";
//             url = url + fxPassword + "&";
//             url = url + "to=";
//             url = url + toPhone + "&";
//             url = url + "m=" + msg;
            string formUrl = String.Format("http://{0}:3000/gmManage", ip);
            string formData = url;                               //提交的参数

            //注意提交的编码 这边是需要改变的 这边默认的是Default：系统当前编码
            byte[] postData = Encoding.UTF8.GetBytes(formData);

            // 设置提交的相关参数 
            HttpWebRequest request = WebRequest.Create(formUrl) as HttpWebRequest;
            Encoding myEncoding = Encoding.UTF8;
            request.Method = "POST";
            request.KeepAlive = false;
            request.AllowAutoRedirect = true;
            request.ContentType = "application/x-www-form-urlencoded";
            request.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR  3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)";
            request.ContentLength = postData.Length;

            // 提交请求数据 
            System.IO.Stream outputStream = request.GetRequestStream();
            outputStream.Write(postData, 0, postData.Length);
            outputStream.Close();

            HttpWebResponse response;
            Stream responseStream;
            StreamReader reader;
            string srcString;
            response = request.GetResponse() as HttpWebResponse;
            responseStream = response.GetResponseStream();
            reader = new System.IO.StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
            srcString = reader.ReadToEnd();
            string result = srcString;   //返回值赋值

            var mJObj = JArray.Parse(result);
            Lable1.Text = (mJObj.Count).ToString();
            for (int i = 0; i < mJObj.Count; i++)
            {
                ListBox1.Items.Add(mJObj[i]["_account"].ToString());
            }

            reader.Close();
 
        }
        catch(Exception exp)
        {
            strResult = "错误：" + exp.Message;
        }

    }
    protected void Button7_Click(object sender, EventArgs e)
    {
        string strResult = "";
        try
        {
            string url = "act=GetGameTotalData";
            //             url = url + "p=";
            //             url = url + fxPassword + "&";
            //             url = url + "to=";
            //             url = url + toPhone + "&";
            //             url = url + "m=" + msg;

            string formUrl = String.Format("http://{0}:3000/gmManage", ip);
            string formData = url;                               //提交的参数

            //注意提交的编码 这边是需要改变的 这边默认的是Default：系统当前编码
            byte[] postData = Encoding.UTF8.GetBytes(formData);

            // 设置提交的相关参数 
            HttpWebRequest request = WebRequest.Create(formUrl) as HttpWebRequest;
            Encoding myEncoding = Encoding.UTF8;
            request.Method = "POST";
            request.KeepAlive = false;
            request.AllowAutoRedirect = true;
            request.ContentType = "application/x-www-form-urlencoded";
            request.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR  3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)";
            request.ContentLength = postData.Length;

            // 提交请求数据 
            System.IO.Stream outputStream = request.GetRequestStream();
            outputStream.Write(postData, 0, postData.Length);
            outputStream.Close();

            HttpWebResponse response;
            Stream responseStream;
            StreamReader reader;
            string srcString;
            response = request.GetResponse() as HttpWebResponse;
            responseStream = response.GetResponseStream();
            reader = new System.IO.StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
            srcString = reader.ReadToEnd();
            string result = srcString;   //返回值赋值

            var mJObj = JObject.Parse(result);
            if (mJObj.Count > 0)
            {
                Label2.Text = mJObj["winScore"].ToString();
                Label3.Text = mJObj["lotteryCount"].ToString();
            }

            reader.Close();

        }
        catch (Exception exp)
        {
            strResult = "错误：" + exp.Message;
        }
    }

    protected void Button9_Click(object sender, EventArgs e)
    {
        string strResult = "";
        try
        {
            string url = "act=maintainServer";
            //             url = url + "p=";
            //             url = url + fxPassword + "&";
            //             url = url + "to=";
            //             url = url + toPhone + "&";
            //             url = url + "m=" + msg;

            string formUrl = String.Format("http://{0}:3000/gmManage", ip);
            string formData = url;                               //提交的参数

            //注意提交的编码 这边是需要改变的 这边默认的是Default：系统当前编码
            byte[] postData = Encoding.UTF8.GetBytes(formData);

            // 设置提交的相关参数 
            HttpWebRequest request = WebRequest.Create(formUrl) as HttpWebRequest;
            Encoding myEncoding = Encoding.UTF8;
            request.Method = "POST";
            request.KeepAlive = false;
            request.AllowAutoRedirect = true;
            request.ContentType = "application/x-www-form-urlencoded";
            request.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR  3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)";
            request.ContentLength = postData.Length;

            // 提交请求数据 
            System.IO.Stream outputStream = request.GetRequestStream();
            outputStream.Write(postData, 0, postData.Length);
            outputStream.Close();

            HttpWebResponse response;
            Stream responseStream;
            StreamReader reader;
            string srcString;
            response = request.GetResponse() as HttpWebResponse;
            responseStream = response.GetResponseStream();
            reader = new System.IO.StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
            srcString = reader.ReadToEnd();
            string result = srcString;   //返回值赋值

            var mJObj = JObject.Parse(result);
            if (mJObj.Count > 0)
            {
                Label2.Text = mJObj["winScore"].ToString();
                Label3.Text = mJObj["lotteryCount"].ToString();
            }

            reader.Close();

        }
        catch (Exception exp)
        {
            strResult = "错误：" + exp.Message;
        }
    }

    protected void Button10_Click(object sender, EventArgs e)
    {
        string strResult = "";
        try
        {
            string url = "act=colseServer";
            //             url = url + "p=";
            //             url = url + fxPassword + "&";
            //             url = url + "to=";
            //             url = url + toPhone + "&";
            //             url = url + "m=" + msg;

            string formUrl = String.Format("http://{0}:3000/gmManage", ip);
            string formData = url;                               //提交的参数

            //注意提交的编码 这边是需要改变的 这边默认的是Default：系统当前编码
            byte[] postData = Encoding.UTF8.GetBytes(formData);

            // 设置提交的相关参数 
            HttpWebRequest request = WebRequest.Create(formUrl) as HttpWebRequest;
            Encoding myEncoding = Encoding.UTF8;
            request.Method = "POST";
            request.KeepAlive = false;
            request.AllowAutoRedirect = true;
            request.ContentType = "application/x-www-form-urlencoded";
            request.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR  3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)";
            request.ContentLength = postData.Length;

            // 提交请求数据 
            System.IO.Stream outputStream = request.GetRequestStream();
            outputStream.Write(postData, 0, postData.Length);
            outputStream.Close();

            HttpWebResponse response;
            Stream responseStream;
            StreamReader reader;
            string srcString;
            response = request.GetResponse() as HttpWebResponse;
            responseStream = response.GetResponseStream();
            reader = new System.IO.StreamReader(responseStream, Encoding.GetEncoding("UTF-8"));
            srcString = reader.ReadToEnd();
            string result = srcString;   //返回值赋值

            var mJObj = JObject.Parse(result);
            if (mJObj.Count > 0)
            {
                Label2.Text = mJObj["winScore"].ToString();
                Label3.Text = mJObj["lotteryCount"].ToString();
            }

            reader.Close();

        }
        catch (Exception exp)
        {
            strResult = "错误：" + exp.Message;
        }
    }
    protected void Button8_Click(object sender, EventArgs e)
    {

    }

    protected void abc()
    {

    }

}