using Newtonsoft.Json;
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
using System.Xml;

public partial class Game : System.Web.UI.Page
{
    string ip = "192.168.1.170";

    protected void Page_Load(object sender, EventArgs e)
    {

        if (null == Session["Token"])
        {
            SetToken();
        }

        Sports.Attributes.Add("onclick", "this.form.target='_blank'");
        Button2.Attributes.Add("onclick", "this.form.target='_blank'");


        Button3.Attributes.Add("onclick", "this.form.target=''");
        Button4.Attributes.Add("onclick", "this.form.target=''");
        Button5.Attributes.Add("onclick", "this.form.target=''"); 
        Button6.Attributes.Add("onclick", "this.form.target=''"); 
        Button7.Attributes.Add("onclick", "this.form.target=''");

        Logout.Attributes.Add("onclick", "this.form.target=''"); 
        if (Session["UserName"] != null)
        { 
            Username.Text = Session["UserName"].ToString();
            AccountAmount.Text = Session["AccountAmount"].ToString();
            FishAccountAmount.Text = Session["FishAccountAmount"].ToString();
            SportAccountAmount.Text = Session["SportAccountAmount"].ToString();
            
        }
        else
        {
            Response.Redirect("Default.aspx");
        }

    }
    protected void Sports_Click(object sender, EventArgs e)
    {
        string url = String.Format("http://api.igk99.com/api.aspx?secret=w1865u&agent=a8t&username={0}&action=login&serial=w1865u&amount=1&lang=ZH-CN&accType=HK&host=sport.igk99.com", Username.Text);//请求登录的URL
        int errcode = 1;
        string host,u_s,k,lang,accType,r;
        host = "";
        u_s = "";
        k = "";
        lang = "";
        accType = "";
        r = "";
        
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          //请求方式是POST
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.Default);
            string text2 = sr2.ReadToEnd();
            //HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");
            //ResultT result1 = (ResultT)JsonConvert.DeserializeObject(text2, typeof(ResultT));

            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(text2);
            XmlNode rootNode = xmlDoc.SelectSingleNode("response");
            foreach (XmlNode xxNode in rootNode.ChildNodes)
            {
                if ("errcode" == xxNode.Name)
                {
                    errcode = int.Parse(xxNode.InnerText);
                }
                else if ("result" == xxNode.Name)
                {
                    foreach (XmlNode xxNodeN in xxNode.ChildNodes)
                    {
                        if ("login" == xxNodeN.Name)
                        {
                            foreach (XmlNode xxxNodeN in xxNodeN.ChildNodes)
                            {
                                if ("host" == xxxNodeN.Name)
                                {
                                    host = xxxNodeN.InnerText;
                                }
                                else if ("param" == xxxNodeN.Name)
                                {
                                    foreach (XmlNode xxNodeNN in xxxNodeN.ChildNodes)
                                    {
                                        if ("us" == xxNodeNN.Name)
                                        {
                                            u_s = xxNodeNN.InnerText;
                                        }
                                        else if ("k" == xxNodeNN.Name)
                                        {
                                            k = xxNodeNN.InnerText;
                                        }
                                        else if ("lang" == xxNodeNN.Name)
                                        {
                                            lang = xxNodeNN.InnerText;
                                        }
                                        else if ("accType" == xxNodeNN.Name)
                                        {
                                            accType = xxNodeNN.InnerText;
                                        }
                                        else if ("r" == xxNodeNN.Name)
                                        {
                                            r = xxNodeNN.InnerText;
                                        }
                                    }
                                }
                            }
                        }
                        
                    }
                }
            }

        }
        catch (Exception ex)
        {
            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }


        if (errcode == 0)
        {
            string newurl = String.Format("http://sport.igk99.com/public/validate.aspx?us={0}&k={1}&lang={2}&accType={3}&r={4}", u_s, k, lang,accType,r);
            //string newurl = String.Format("Sports.aspx?u_s={0}&k={1}&lang={2}&accType={3}&r={4}", u_s, k, lang, accType, r);
            Response.Redirect(newurl);
        }

    }

    protected void Sports_up(object sender, EventArgs e)
    {

        if (Request.Form.Get("hiddenTestN").Equals(GetToken()))
        {
//             lblMessage.ForeColor = System.Drawing.Color.Blue;
//             lblMessage.Text = "正常提交表单";
            SetToken();//别忘了最后要更新Session中的标志

            double count = ChangeText(TextBox1.Text);
            if (count == 0.0) return;
            TextBox1.Text = "";
            sendData(Session["UserName"].ToString(), Session["PassWord"].ToString(), 4, count);

        }
//         else
//         {
//             lblMessage.ForeColor = System.Drawing.Color.Red;
//             lblMessage.Text = "重复完成";
/*        }*/

    }

    protected void Sports_down(object sender, EventArgs e)
    {
        if (Request.Form.Get("hiddenTestN").Equals(GetToken()))
        {
            SetToken();
            double count = ChangeText(TextBox1.Text);
            if (count == 0.0) return;
            TextBox1.Text = "";
            sendData(Session["UserName"].ToString(), Session["PassWord"].ToString(), 3, count);
        }
    }

    protected void Fish_up(object sender, EventArgs e)
    {
        if (Request.Form.Get("hiddenTestN").Equals(GetToken()))
        {
            SetToken();
            double count = ChangeText(TextBox2.Text);
            if (count == 0.0) return;
            TextBox2.Text = "";
            sendData(Session["UserName"].ToString(), Session["PassWord"].ToString(), 2, count);
        }
    }

    protected void Fish_down(object sender, EventArgs e)
    {
        if (Request.Form.Get("hiddenTestN").Equals(GetToken()))
        {
            SetToken();
            double count = ChangeText(TextBox2.Text);
            if (count == 0.0) return;
            TextBox2.Text = "";
            sendData(Session["UserName"].ToString(), Session["PassWord"].ToString(),1,count);
        }
    }


    protected void Logout_Click(object sender, EventArgs e)
    {
        Session["UserName"] = null;
        Session["AccountAmount"] = null;
        Session["PassWord"] = null;
        Session["FishAccountAmount"] = null;
        Session["SportAccountAmount"] = null;
        Response.Redirect("Default.aspx");
    }

    protected void Rush_Click(object sender, EventArgs e)
    {

        Response.Redirect("Login.aspx");
    }


    public double ChangeText(string text)
    {
        double result = 0.0;
        try
        {
            result = double.Parse(text);
        }
        catch
        {
            this.Response.Write(" <script language=javascript>alert('输入有误');window.window.location.href='Game.aspx';</script> ");
            return 0.0;
        }
        return result;
    }

    public bool sendData(string name, string pass ,int typeIndex ,double count)
    {
        if (name == "" || name == null || pass == "" || pass == null || typeIndex <1 || typeIndex > 4 || count < 1) return false;

        bool result = false;

        pass = name + count + "89b5b987124d2ec3";

        string password = GetMd5Str32(pass);

        string type = "";
        switch (typeIndex)
        {
            case 1:
                type = "FishPointsWithdraw";    //捕鱼减分
                break;
            case 2:
                type = "FishPointsAdd";         //捕鱼加分
                break;
            case 3:
                type = "SportPointsWithdraw";   //运动减分
                break;
            case 4:
                type = "SportPointsAdd";        //运动加分
                break;
        }


        string url = String.Format("http://{0}:8088/PointServer.aspx?Account={1}&Sign={2}&Type={3}&AddPoints={4}",ip, name, password, type, count);
        try
        {
            HttpWebRequest webRequest2 = (HttpWebRequest)WebRequest.Create(url);  //新建一个WebRequest对象用来请求或者响应url
            webRequest2.Method = "GET";                                          
            HttpWebResponse response2 = (HttpWebResponse)webRequest2.GetResponse();
            StreamReader sr2 = new StreamReader(response2.GetResponseStream(), Encoding.UTF8);
            string text2 = sr2.ReadToEnd();
            //HttpContext.Current.Response.Write("text2:" + text2 + "<br/>");
            ResultT result1 = (ResultT)JsonConvert.DeserializeObject(text2, typeof(ResultT));

            if (result1.Result.RtCoder == 0)
            {
                result = true;
                Session["AccountAmount"] = result1.Result.AccountAmount;
                Session["FishAccountAmount"] = result1.Result.FishAccountAmount;
                Session["SportAccountAmount"] = result1.Result.SportAccountAmount;

                this.Response.Write(" <script language=javascript>alert('成功');window.window.location.href='Game.aspx';</script> ");
            }
            else
            {
                this.Response.Write(" <script language=javascript>alert('失败," + result1.Result.Message + "');window.window.location.href='Game.aspx';</script> ");

            }

        }
        catch (Exception ex)
        {

            //HttpContext.Current.Response.Write("ex:" + ex.ToString());
        }

        return result;
    }
    public string GetToken()
    {
        if (null != Session["Token"])
        {
            return Session["Token"].ToString();
        }
        else
        {
            return string.Empty;
        }
    }

    private void SetToken()
    {
        Session.Add("Token", GetMd5Str32(Session.SessionID + DateTime.Now.Ticks.ToString()));
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
    protected void Button2_Click(object sender, EventArgs e)
    {
        Response.Redirect("http://goo7788.com");
    }
}

