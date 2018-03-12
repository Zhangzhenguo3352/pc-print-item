var state = Math.random();

// 显示登录二维码
function show_login_qrcode()
{
    ajaxPost(`${service}/user/login`, {'state' : state}, function(data)
    {
        if(data.code==SUCCESS)
        {
            if(data.data)
            {
                $('#qrcode').attr('src', `data:image/png;base64,${data.data}`);
                $('#qrcode').on('load', function()
                {
                    setTimeout(check_login, 3000); // check login after timeout
                });                
            }
        }
        else
        {
            setTimeout(show_login_qrcode, 3000);
        }
    },
    function()
    {
        setTimeout(show_login_qrcode, 3000);
    });
}

// 检查登录
function check_login()
{
    ajaxPost(`${service}/user/check`, {'timeout' : 60, 'state' : state},
    function(data)
    {
        if(data.code == SUCCESS)
        {
            go_settings(false);
        }
        else
        {
            console.log('not logged in yet, will retry 6 seconds later!');
            setTimeout(check_login, 6000);
        }
    },
    function()
    {
        console.log('login failed, will retry 6 seconds later!');
        setTimeout(check_login, 6000);        
    });
}

// 跳转至设置页面
function go_settings(is_usb)
{
    sessionStorage.setItem('is_usb', is_usb);
    window.location.href = "./settings.html";
}

$(function()
{
    sessionStorage.removeItem('is_usb');
    
    show_login_qrcode();

    $('#wx_print').click(function()
    {
        go_settings(false);
    });

    $('#U_print').click(function()
    {
        go_settings(true);
    });

    // go to ad
    setTimeout(function()
    {
        window.location.href = "./waiting.html";
    }, 60000);
})