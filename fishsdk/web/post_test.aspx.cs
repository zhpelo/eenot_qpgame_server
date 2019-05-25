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

public partial class post_test : System.Web.UI.Page
{
    string ip = "103.203.49.82";
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        for(int i = 0;i< 1000;i++)
        {
            string act = "reg";
            string accountname = "robot" + i;
            string nickname = "ls_t";
            string pwd = "11111";
            string time = GetTimeStamp();
            string key = "42dfcb34fb02d8cd";
            string sing = act + accountname + nickname + pwd + time + key;
            string md5sing = GetMd5Str32(act + accountname + nickname + pwd + time + key);

            string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&nickname={3}&pwd={4}&time={5}&sign={6}&goldnum=100", ip, act, accountname, nickname, pwd, time, md5sing);

            try
            {
                HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
                webRequest2.Method = "GET";                                          //请求方式是POST
                HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
                StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
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
        string accountname = "haha001";
        string goldnum = "10000";
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
        string act = "Goldquery";
        string accountname = "haha001";
        string time = "1468422000";
        string pro = "1";
        string key = "42dfcb34fb02d8cd";
        string sing = act + pro +accountname + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}/Activity/gameuse.aspx?act={1}&accountname={2}&time={3}&sign={4}&pno=1", ip, act, accountname, time, md5sing);
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
        string accountname = "haha001";
        string pwd = "111112";
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
        string accountname = "haha001";
        string pwd = "111111";
        string time = GetTimeStamp();
        string key = "42dfcb34fb02d8cd";
        string sing = act + accountname + pwd + time + key;
        string md5sing = GetMd5Str32(sing);

        string url = String.Format("http://{0}:3000/Activity/gameuse?act={1}&accountname={2}&goldnum={3}&time={4}&sign={5}", ip, act, accountname, pwd, time, md5sing);
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
}