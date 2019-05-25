using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;


public partial class Login : System.Web.UI.Page
{
    string ip = "192.168.1.170";
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            string name = Request.QueryString["name"];
            string pass = Request.QueryString["pass"];

            if (ExecLogin(name, pass))
            {
                //Label1.Text = "登陆成功";
                Response.Redirect("Game.aspx");
            }
            else
            {
                //Label1.Text = "登陆失败";
                Response.Redirect("Default.aspx?login=2");
            }

        }

       

        //Label1.Text = "2";

    }

    public bool ExecLogin(string name, string pass)
    {
        bool result = false;
        string password = "";

        pass = pass + "89b5b987124d2ec3";
        password = GetMd5Str32(pass);


        
        //string padata = "username=" + name + "&pwd=" + password + "&imgcode=&f=json";
        string url = String.Format("http://{0}:8088/WeFishbServerLogin.aspx?Account={1}&Sign={2}",ip, name, password);
        //url = "http://103.203.49.82:8088/WeFishbServerLogin.aspx?Account=sport002&Sign=411472b3859ee99bdd532561ee4e6639";
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            //HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");
            ResultT result1 = (ResultT)JsonConvert.DeserializeObject(text2, typeof(ResultT));

            if (result1.Result.RtCoder == 0)
            {
                result = true;
                Session["UserName"] = name;
                Session["PassWord"] = password;
                Session["AccountAmount"] = result1.Result.AccountAmount;
                Session["FishAccountAmount"] = result1.Result.FishAccountAmount;
                Session["SportAccountAmount"] = result1.Result.SportAccountAmount;
            }

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }

        return result;
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


        class ResultT
    {
        public ResultTT Result { get; set; }
    }

    class ResultTT
    {
        public int RtCoder { get; set; }
        public string Message { get; set; }
        public string Versions { get; set; }
        public int Maintenance { get; set; }
        public double AccountAmount { get; set; }
        public double FishAccountAmount { get; set; }
        public double SportAccountAmount { get; set; }

    }
}

