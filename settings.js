var tid; // 设备ID
var price; // 定价

var is_usb = sessionStorage.getItem('is_usb') === 'true';

var files_parent_dir = ''; // 上级目录
var files_current_dir = ''; // 当前目录
var left_files = []; // 左侧文件列表
var right_files_to_print = []; // 右侧待打印文件列表，hash作为下标进行索引

var data_of_last_order; // 上次提交的订单数据
var data_of_last_order_is_dirty = false; // 提交后数据是否被修改

function read_tid()
{
    ajaxPost(`${dcpware}/tid`, {}, 
    function(data)
    {
        tid = data.tid;
        read_price(tid);
    }, 
    function(data)
    {
        swal({ 
            title : "操作失败", 
            text : "系统故障", 
            type : "warning",
            timer : 2000, 
            showConfirmButton : true             
          },
          function(){
              error("无法读取设备ID");
          });
        tid = "001"; // todo: delete temporary code.
        read_price(tid); // todo: delete temporary code.
    });    
}

function read_price(tid)
{
    ajaxPost(`${service}/print/price`, {
        "tid" : tid
    }, 
    function(data)
    {
        price = data;
    }, 
    function(data)
    {
        error("无法读取定价");
    });
}

function render_image_icon(item) 
{
    var html = ''
    if(is_usb)
    {
        html = `${item.directory ? `<img src="./assets/folder.png" style="width:70px;height:auto" onError="this.src='./assets/question-mark.png'"/>` : `<img src="./assets/${item.ext}.png" style="width:70px;height:auto" onError="this.src='./assets/question-mark.png'"/>` }`
    } 
    else 
    {
        html = `${fileNameCompare(item.ext) ? `<img src="${item.url}" title="${item.name}" style="height: auto" onError="this.src='./assets/question-mark.png'"/>`: `<img src="./assets/folder.png" style="width:70px;height:auto" onError="this.src='./assets/question-mark.png'"/>`}`
    }
    return html;
}

// 从U盘读取文件
function load_usb_files(callback, dir)
{
    ajaxPost(`${dcpware}/getUsbFile`, {url : dir || ""}, function(data)
    {
        files_parent_dir = data.data.parentDir;
        files_current_dir = data.data.thisDir;
        
        left_files = data.data.fileList;
        
        callback(data.data.fileList);
    });
}

// 从云端读物文件
function load_cloud_files(callback)
{
    ajaxPost(`${service}/userFile/fileList`, {}, function(data)
    {
        left_files = data.data;
        callback(data.data);
    });
}

// 读取文件
function load_files(callback, dir)
{
    is_usb ? load_usb_files(callback, dir) : load_cloud_files(callback);
}

// 选中了左侧文件，如果是目录则进入子目录，如果是文件则加入右侧待打印文件列表
function left_file_clicked(element)
{
    var index = $(element).attr('index');
    var file = left_files[index];
    
    file.directory ? 
        load_files(render_left_files_callback, left_files[index].url) : 
        add_to_right(file);
}

// 加入右侧待打印文件列表
function add_to_right(file)
{
    if(!price)
    {
        console.log('price is not ready, quit.');
    }
    
    // avoid duplication
    if(right_files_to_print[file.hash])
    {
        console.log(`${file.name} was added already.`);
        return;
    }

    if(file.hash.indexOf('.') != -1)
    {
        console.log('id can not have a . character.');
        return;
    }
    
    console.log(`add ${file.name} to right`);
    
    file.copies = 1;
    file.config = '00,10,20'; // 任何文件默认为 A4/单面/黑白
    file.subtotal = file.copies * price[file.config];
    
    right_files_to_print[file.hash] = file;
    
    // find the template
    var template = $('#right_list').find('li').eq(0);
    template.attr('id', file.hash);
    
    $(template).after(template.prop("outerHTML")); // insert first mode
    //$('.listBox').append(template.prop("outerHTML")); // apend last mode
    
    // clear template's temporary index attribute
    $(template).removeAttr('id');
    
    // update file data
    $(`#${file.hash} div>div>img`).attr('src', `./assets/${file.ext}.png`);
    $(`#${file.hash} .title h2>span`).text(`${file.name}（${file.pages}页）`);
    $(`#${file.hash} div>div>div>span`).text(fen2Yuan(file.subtotal));

    // it's show time
    $('#right_list').find('.liBox .singleSelect').hide(); // hide all    
    $('#right_list').find('.liBox').eq(1).show(10); // show me    
    $('#right_list').find('.liBox .singleSelect').eq(1).show(10); // show me
    
    update_total();
}

// 从右侧待打印文件列表中删除
function delete_from_right(element)
{
    element = $(element).parents(".liBox");
    var index = element.attr('id');
    
    console.log(`${right_files_to_print[index].name} delete from right.`);
    
    element.remove();
    right_files_to_print[index] = false; // simple disable this file.
    
    update_total();
}

// 展开收起单个文件设置
function toggle_single_settings(element)
{
    var show = $(element).parents(".liBox").children('.singleSelect').is(':visible');

    $('#right_list .singleSelect').hide(); // hide all
    
    // toggle me
    show ?
    $(element).parents(".liBox").children('.singleSelect').hide() :
    $(element).parents(".liBox").children('.singleSelect').show()
}

// 更新单个文件打印配置
function update_config(element)
{
    var index = $(element).parents(".liBox").attr('id');
    var html = $(`#${index}`).html(); // save
    
    $(element).parent().children("li").removeClass("active");
    $(element).addClass("active");
    
    var current = $(element).text(); // 当前点击的选项
    var options = $(`#${index} .singleSelect li`); // 所有选项
    
    if(current.indexOf('照片') != -1)
    {
        $(options).eq(0).addClass("active"); // 单面
        $(options).eq(1).removeClass("active"); // 双面
        $(options).eq(2).removeClass("active"); // 黑白
        $(options).eq(3).addClass("active"); // 彩色
        $(options).eq(0).show(50); // 单面
        $(options).eq(1).hide(50); // 双面
        $(options).eq(2).hide(50); // 黑白
        $(options).eq(3).show(50); // 彩色        
    }
    else if(current.indexOf('黑白') != -1)
    {
        $(options).eq(4).addClass("active"); // A4
        $(options).eq(5).removeClass("active"); // 7寸照片
        $(options).eq(6).removeClass("active"); // 1寸照片
        $(options).eq(7).removeClass("active"); // 2寸照片
        $(options).eq(4).show(50); // A4
        $(options).eq(5).hide(50); // 7寸照片
        $(options).eq(6).hide(50); // 1寸照片
        $(options).eq(7).hide(50); // 2寸照片        
    }
    else if(current.indexOf('双面') != -1)
    {
        $(options).eq(4).addClass("active"); // A4
        $(options).eq(5).removeClass("active"); // 7寸照片
        $(options).eq(6).removeClass("active"); // 1寸照片
        $(options).eq(7).removeClass("active"); // 2寸照片
        $(options).eq(4).show(50); // A4
        $(options).eq(5).hide(50); // 7寸照片
        $(options).eq(6).hide(50); // 1寸照片
        $(options).eq(7).hide(50); // 2寸照片        
    }
    else
    {
        $(options).eq(0).show(50);
        $(options).eq(1).show(50);
        $(options).eq(2).show(50);
        $(options).eq(3).show(50);        
        $(options).eq(4).show(50);
        $(options).eq(5).show(50);
        $(options).eq(6).show(50);
        $(options).eq(7).show(50);    
    }
    
    var configs = $(`#${index} .active`);
    
    var config = "";
    config += configs.eq(2).attr('value') + ",";
    config += configs.eq(0).attr('value') + ",";
    config += configs.eq(1).attr('value');
    
    var configText = "";
    configText += configs.eq(2).text() + "/";
    configText += configs.eq(0).text() + "/";
    configText += configs.eq(1).text();
    
    $(`#${index} .clickSet`).text(configText);
    
    console.log(config + '->' + configText);
    
    if(!price[config])
    {
        swal({ 
            title : '现在不能打印', 
            text : $(`#${index} .clickSet`).text(), 
            type : "warning",
            timer : 2000, 
            showConfirmButton : true
          });             
        $(`#${index}`).html(html); // restore
        return;
    }
    
    var file = right_files_to_print[index];
    file.config = config;
    
    update_subtotal(element);
}

// 更新单个文件打印份数
function update_copies(element, n)
{
    var index = $(element).parents(".liBox").attr('id');
    var file = right_files_to_print[index];
    
    if(!file)
    {
        console.log(`error: file ${index} should be invisable.`);
        return;
    }
    
    if(file.copies==0 && n==-1)
    {
        return;
    }
    
    file.copies += n;
    
    if(file.copies==0)
    {
        $(`#${index} .addAndRemove div`).addClass('less disabled');
    }
    else
    {
        $(`#${index} .addAndRemove div`).removeClass('less disabled');
    }
    
    $(`#${index} .num.printQuantity`).html(file.copies);
    
    update_subtotal(element);
}

// 更新单个文件价格小计
function update_subtotal(element)
{
    var index = $(element).parents(".liBox").attr('id');
    var file = right_files_to_print[index];
    
    file.subtotal = file.copies * price[file.config] || 0;
    
    $(`#${index} div>div>span`).text(fen2Yuan(file.subtotal));
    
    console.log("todo: update subtotal.");
    update_total();
}

// 清理待打印文件（去掉打印分数为0，或者已经从右侧删除的）
function get_files_to_print()
{
    var files_to_print = [];
    
//    for (let file of values(right_files_to_print)) 
//    {  
//        if(file && file.copies>0)
//        {
//            files_to_print.push(file);
//        }        
//    }
    
//    for(file in right_files_to_print.values())
//    {
//        if(file && file.copies>0)
//        {
//            files_to_print.push(file);
//        }
//    }
    
    for(index in right_files_to_print)
    {
        var file = right_files_to_print[index];
        if(file && file.copies>0 && file.subtotal>0)
        {
            files_to_print.push(file);
        }
    }
    
    return files_to_print;
}

// 更新价格总计
function update_total()
{
    var files_to_print = get_files_to_print();
    var total = 0;
    
    for(var file of files_to_print)
    {
        total += file.subtotal;
    }
    
    $('.paymentAmount').html(fen2Yuan(total));
    
    files_to_print.length >0 ? $('#total').show() : $('#total').hide();
    
    $('#submit > div').attr('class', total > 0 ? 'submit' : 'submit active');
    
    console.log("total=" + total);
    
    data_of_last_order_is_dirty = true;
    
    return total;
}

// 显示支付二维码
function show_payment(refresh_qrcode_only)
{
    var total = parseFloat($('.paymentAmount').eq(0).text()) * 100;
    
    if(total == 0)
    {
        if(Object.values(right_files_to_print).length == 0)
        {
            swal({ 
                title : "请选取您想打印的文件", 
                text : "请从左侧文件列表中选择", 
                type : "warning",
                timer : 2000, 
                showConfirmButton : false    
            });
        }
        return;
    }
    
    var data = {};
    
    // 避免生成重复订单
    if(data_of_last_order_is_dirty && !refresh_qrcode_only)
    {
        var files = get_files_to_print();
        var data =  {
            files: files,
            tid : tid, 
            isUSB : is_usb ? 1 : 0,
            total : total        
        };        
        if(data_of_last_order == JSON.stringify(data))
        {
            data_of_last_order_is_dirty = false;
            data = {};
            console.log("post data cleared for print data is not changed.");
        }
    }
    
    ajaxPost(`${service}/payment/pay`, data, function(data)
    {
        if(data.code==SUCCESS)
        {
            if(data.data)
            {
                $('#payment img').attr('src', `data:image/png;base64,${data.data}`);
                $('#payment img').on('load', function()
                {
                    $('#payment').show();
                    setTimeout(check_payment(), 3000); // check payment after timeout.  
                });                
            }
        }
        else
        {
            swal({ 
                title: "操作失败", 
                text: data.message, 
                type: "warning"
              });
        }
    });
    
    if(data_of_last_order_is_dirty)
    {
        data_of_last_order = JSON.stringify(data);
        data_of_last_order_is_dirty = false;        
    }
}

// 检查是否已经支付
function check_payment()
{
    ajaxPost(`${service}/payment/check`, {"timeout" : 60}, function(data)
    {
        if(data.code == SUCCESS)
        {
            console.log('payed!');
            go_print();
            $('#payment').hide();
        }
        else
        {
            console.log('not payed, retry!');
            setTimeout('show_payment(true)', 6000);            
        }
    });
}

// 提交打印
function go_print() 
{
    var files = get_files_to_print();
    ajaxPost(`${dcpware}/print`, {'is_usb' : is_usb, 'files' : files}, function(data)
    {
        if(data.code > 0)
        {
            sweetAlert(data.message);
            return;
        }
        
        sessionStorage.setItem('is_printing', true);
        sessionStorage.setItem('files', JSON.stringify(files));
        
        window.location.href = './waiting.html';
    });
}

// 显示左侧文件列表
function render_left_files_callback(data)
{
    $('#leftBox').html('');
    
    if(!data)
    {
        console.log('error: call render_left_files_callback with empty data.');
        return;
    }
    
    data.map((item, index) => 
    {
        if(item.hash && item.hash.indexOf('.') != -1)
        {
            console.log('hash is empty, or can not have a . character.');
        }
        else
        {
            item.index = index;
            if(item.directory || checkoutFileFormat(item.ext))
            {
                var time = $.formatDateTime('yy-mm-dd hh-ii', new Date(item.createTime));
                $('#leftBox').append(`
                <li index=${index} class="canBeUsed ${item.directory? 'File' : 'noFile'}" onclick="left_file_clicked(this);">
                    <div class="imgBox">
                        ${render_image_icon(item)}
                    </div>
                    <div>
                        <h2 title=${item.name}>${InterceptionString(item.name, 20)}</h2>
                        <div>
                            <span>${time}</span>
                            <span style="padding-right: 0px">${item.directory ? "": readableFileSize(item.size )}</span>
                        </div>
                    </div>
                    <div class="x_add"></div>
                </li>`);
            }
        }
    });
}

$(function() 
{
    read_tid();
    
    load_files(render_left_files_callback);
    
    $('#back').on('click', function()
    {
        console.log(files_parent_dir);
        load_files(render_left_files_callback, files_parent_dir);
    });

    $('#refresh').on('click', function()
    {
        console.log(files_current_dir);
        load_files(render_left_files_callback, files_current_dir);
    });

     // 安全退出
    $('#dropOut').on('click', function()
    {
        console.log("I'm logging out.");
        
        ajaxPost(`${dcpware}/logout`);
        ajaxPost(`${service}/user/logout`);
        
        window.location.href = is_usb ? './prompt-take-usb.html' : './thanks.html';
    });    
});