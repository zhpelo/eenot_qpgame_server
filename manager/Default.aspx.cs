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
    string ip = "127.0.0.1";
    //string ip = "139.5.203.26";
    //string ip = "120.76.200.182";
    //string ip = "120.76.240.16";
    //string ip = "52.193.83.112";
    //string ip = "120.76.194.95";
    //string ip = "119.81.251.177";
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        for (int i = 0; i < 1; i++)
        {
            string act = "reg";
            string test = "55";
            string accountname = "gtjsa1" + test;
            //string nickname = Server.UrlEncode("中文");
            string nickname = "gtjsa" + test;
            string pwd = "gtjsa"+  test + test ;
            string time = GetTimeStamp();
            string key = "42dfcb34fb02d8cd";
            string sing = act + accountname + nickname + pwd + time + key;
            string md5sing = GetMd5Str32(act + accountname + nickname + pwd + time + key);

            string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&accountname={2}&nickname={3}&pwd={4}&time={5}&sign={6}&goldnum=0", ip, act, accountname, nickname, pwd, time, md5sing);

            try
            {
                HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
                webRequest2.Method = "GET";                                          //请求方式是POST
                HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
                StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
                string text2 = sr2.ReadToEnd();
                HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");

            }
            catch (Exception ex)
            {
                //HttpContext.Current.Response.Write("ex:" + ex.ToString());
            }
        }
    }

    protected void Button18_Click(object sender, EventArgs e)
    {
        string act = "register";
        string accountname = "11111@";
        string nickname = "111112";
        string pwd = "111111";
        string agc = "";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + nickname + pwd + time + key;
        string md5sing = GetMd5Str32(act + accountname + nickname + pwd + time + key);

        string url = String.Format("http://{0}:13000/weixinLogin?act={1}&accountname={2}&nickname={3}&pwd={4}&time={5}&sign={6}&agc={7}", ip, act, accountname, nickname, pwd, time, md5sing, agc);

        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
    }
    protected void Button2_Click(object sender, EventArgs e)
    {
        string act = "scoreedit";
        string accountname = "demo_aa14";
        string goldnum = "10000";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + goldnum + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&accountname={2}&goldnum={3}&time={4}&sign={5}", ip, act, accountname, goldnum, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
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
        //string gameid = "1";
        string recordBeginTime = System.DateTime.Now.ToString("yyyy-MM-dd");
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string beginTime = "2017-8-1 00:00";
        string endTime = "2017-8-4 00:00";
        string lineCount = "2";
        string page = "1";
        string sing = act + beginTime + endTime + lineCount + page + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&beginTime={2}&endTime={3}&linecount={4}&page={5}&time={6}&sign={7}", ip, act, beginTime, endTime, lineCount,page, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
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
        string accountname = "demo_aa11";
        string pwd = "gtjsa55555";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + pwd + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&accountname={2}&pwd={3}&time={4}&sign={5}", ip, act, accountname, pwd, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
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
        string accountname = "fff111";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&accountname={2}&time={3}&sign={4}", ip, act, accountname, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
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

        string pkid = "31504";
        string sing = act + pkid + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:13000/Activity/gameuse?act={1}&pkid={2}&time={3}&sign={4}", ip, act, pkid, time, md5sing);
        HttpContext.Current.Response.Write(url);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
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

    protected void Button13_Click(object sender, EventArgs e)
    {
        string strResult = "";
        string time = GetTimeStamp();
        string act = "webGetUser";
        string Account = "abc123";
        string key = "42dfcb34fb02d8cd";

        string sing = act + Account + time + key;
        string md5sing = GetMd5Str32(sing);
        try
        {
            string url = String.Format("act={0}&account={1}&time={2}&sign={3}", act, Account, time, md5sing);

            string formUrl = String.Format("http://{0}:13000/webGetUser", ip);
            string formData = url;                               //提交的参数
            Label5.Text = formUrl;
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

    protected void Button14_Click(object sender, EventArgs e)
    {
        string strResult = "";
        string time = GetTimeStamp();
        string act = "webShopBuy";
        string userId = "abc123";
        string productId = "1";
        string count = "1";
        string key = "42dfcb34fb02d8cd";
        string sing = act + userId + productId + count + time + key;
        string md5sing = GetMd5Str32(sing);
        try
        {
            string url = String.Format("act={0}&userId={1}&productId={2}&count={3}&time={4}&sign={5}", act, userId, productId, count, time, md5sing);

            string formUrl = String.Format("http://{0}:13000/webGetUser", ip);
            string formData = url;                               //提交的参数
            Label5.Text = formUrl;
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


    protected void Button16_Click(object sender, EventArgs e)
    {
        /*
        string username = "1";
        string password = "1";
        string fullname = "1";
        string agc = "42dfcb34fb02d8cd";
        string url_reg = "http://pfapi.ylc888.club/rest/register.php";
        try
        {
            //string url = String.Format("st={0}&username={1}&password={2}&fullname={3}&agc={4}", "", userId, productId, count, time, md5sing);

            string formUrl = url_reg;
            string formData = url;                              //提交的参数
            //Label5.Text = formUrl;
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
         * */
    }

    protected void Button17_Click(object sender, EventArgs e)
    {
        string url = "http://tscand01.3qpay.net/thirdPay/pay/gateway";
        //商户

        string appId = "1002";
        //类型
        string partnerId = "100274";
        string imsi = "1";
        string deviceCode = "1";
        string channelOrderId = "101814870625776544627805014";
        string platform = "1";
        string body = "1";
        string totalFee = "100";
        string payType = "2000";
        string timeStamp = GetTimeStamp();
        string notifyUrl = "www.baidu.com";
        string returnUrl = "www.baidu.com";
        string clientIp = "58.61.244.178";
        string attach = "";
        string detail = "";

        string key = "84a2d81cece00769f82c0ab26d224ff2";

        string signConten = String.Format("appId={0}&timeStamp={1}&totalFee={2}&key={3}", appId, timeStamp, totalFee, key);
        string md5sing = GetMd5Str32(signConten);

        string url2 = String.Format("{0}?appId={1}&partnerId={2}&imsi={3}&deviceCode={4}&channelOrderId={5}&platform={6}&body={7}&detail={8}&totalFee={9}&attach={10}&payType={11}&timeStamp={12}&sign={13}&notifyUrl={14}&returnUrl={15}&clientIp={16}", url, appId, partnerId, imsi, deviceCode, channelOrderId, platform, body, detail,totalFee, attach, payType, timeStamp,md5sing, notifyUrl, returnUrl, clientIp);
        HttpContext.Current.Response.Write(url2);
        Response.Redirect(url2);

    }

    protected void Button15_Click(object sender, EventArgs e)
    {
        string url = "http://gateway.xunbaopay9.com/chargebank.aspx";
        //商户

        string parter = "1275";
        //类型
        string type = "963";
        string value = "100.00";
        string orderid = "123456789s3330";
        string callbackurl = "http://www.example.com/backAction";
        string hrefbackurl = "";
        string payerIp = "127.0.0.1";
        string attach = "";
        string key = "be8c2fadfb764e169f5a59b4315d0889";


        string signConten = String.Format("parter={0}&type={1}&value={2}&orderid={3}&callbackurl={4}{5}", parter, type, value, orderid, callbackurl, key);
        string md5sing = GetMd5Str32(signConten);

        string url2 = String.Format("{0}?parter={1}&type={2}&value={3}&orderid={4}&callbackurl={5}&payerIp={6}&attach={7}&sign={8}&agent={9}", url, parter, type, value, orderid, callbackurl, payerIp, attach, md5sing,"");

        Response.Redirect(url2);
        /*
        HttpContext.Current.Response.Write(url2);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url2);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                   //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            HttpContext.Current.Response.Write("<br/>text2:" + text2);

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }
         */
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
            string formData = url;      //提交的参数

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