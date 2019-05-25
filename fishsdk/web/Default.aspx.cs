using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //IsPostBack;
        if (Session["UserName"] == null || Session["UserName"].ToString() == "")
        {
            UserName.Visible = false;
            Button3.Visible = false;
            Button2.Visible = false;
        }
        else
        {
            TextBox2.Visible = false;
            TextBox1.Visible = false;
            UserName.Visible = true;
            UserName.Text = "用户名:" + Session["UserName"].ToString();
            Button2.Visible = true;
            Button1.Visible = false;
            Button3.Visible = true;
        }


        //用户输入
        TextBox1.Attributes.Add("Value", "请输入用户名");
        TextBox1.Attributes.Add("OnFocus", "if(this.value=='请输入用户名') {this.value=''}");
        TextBox1.Attributes.Add("OnBlur", "if(this.value==''){this.value='请输入用户名'}");
        //密码输入
        //TextBox2.Attributes.Add("Type", "text");
        TextBox2.Attributes.Add("Value", "密码");

        TextBox2.Attributes.Add("OnFocus", "if(this.value=='密码'){this.value='';this.type='password';}");
        TextBox2.Attributes.Add("OnBlur", "if(this.value==''){this.value='密码';this.type='text';}");

        //
        if (!IsPostBack)
        {
            //内容
            if (Request.QueryString["login"] == "2")
                Label2.Text = "登录失败";
        }

    }

    protected void Login_Click(object sender, EventArgs e)
    {
        //Button1.Text = "登录中";
//         Session["UserName"] = null;
//         Session["AccountAmount"] = null;
//         Session["FishAccountAmount"] = null;
//         Session["SportAccountAmount"] = null;
//         Response.Redirect("Default.aspx");

        Response.Redirect("Login.aspx?name=" + TextBox1.Text + "&pass=" + TextBox2.Text);
    }

    protected void LoOut_Click(object sender, EventArgs e)
    {

        Session["UserName"] = null;
        Session["AccountAmount"] = null;
        Session["FishAccountAmount"] = null;
        Session["SportAccountAmount"] = null;

        UserName.Visible = false;
        Button3.Visible = false;
        Button2.Visible = false;

        TextBox2.Visible = true;
        TextBox1.Visible = true;
        Button1.Visible = true;
        
    }

    protected void AgLogin_Click(object sender, EventArgs e)
    {
        Response.Redirect("Game.aspx?lang = abc");
    }
}