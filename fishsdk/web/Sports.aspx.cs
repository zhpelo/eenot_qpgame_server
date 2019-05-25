using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Sports : System.Web.UI.Page
{
    public string url;
    protected void Page_Load(object sender, EventArgs e)
    {
        string u_s = Request.QueryString["u_s"];
        string k = Request.QueryString["k"];
        string lang = Request.QueryString["lang"];
        string accType = Request.QueryString["accType"];
        string r = Request.QueryString["r"];

        url = String.Format("http://sport.igk99.com/public/validate.aspx?us={0}&k={1}&lang={2}&accType={3}&r={4}", u_s, k, lang, accType, r);
        
    }
}