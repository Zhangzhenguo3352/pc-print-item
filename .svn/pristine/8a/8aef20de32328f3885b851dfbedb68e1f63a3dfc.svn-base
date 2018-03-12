


function handleAjax(url, param, callback, isErrShow, getmMode){
    var mode = getmMode || 'GET';
    /*var form = new FormData();
    
    form.append('url', param)*/
    console.log('JSON.stringify(param)',typeof JSON.stringify(param))
    console.log('encodeURIComponent(param)',encodeURIComponent(JSON.stringify(param)))
    console.log(param)
    return $.ajax({
        url: url,
        type: mode,
        dataType: 'JSON',
        data: JSON.stringify(param),
        // data: '{"url":"E:\\"}',
        // data: param,
        // data: encodeURIComponent(JSON.stringify(param)),
        
        
        contentType: 'application/json', // 默认值
        // contentType: 'charset=utf-8', // 默认值
        success: function(res) {
            callback(res);
        },
        error: function(req, textStatus, errorThrown) {
            console.log('textStatus, errorThrown',textStatus, errorThrown);
        }
    });
}

function fileNameCompare(suffix) {
  return /(gif|jpg|jpeg|GIF|JPG|JPEG|png)/.test(suffix)
}

function getDefaultHours(time, flag) {
  var now = new Date(parseInt(time) * 1000);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var Hours = now.getHours();
  var Minutes = now.getMinutes();
  var Seconds = now.getSeconds();
  var am
  if (month < 10) {
    month = "0" + month
  }
  if (date < 10) {
    date = "0" + date
  }
  if (Hours < 10) {
    Hours = "0" + Hours
  }
  if (Minutes < 10) {
    Minutes = "0" + Minutes
  }
  if (Seconds < 10) {
    Seconds = "0" + Seconds
  }
  if (flag == 0) {
    return `${year}-${month}-${date}  ${Hours}:${Minutes}:${Seconds}`
  } else if (flag == 1) {
    return `${year}.${month}.${date}  ${Hours}.${Minutes}.${Seconds}`

  } else if (flag == 2) {
    return `${year}.${month}.${date}`
  } else if (flag == 3) {
    return `${year}-${month}-${date}  ${Hours}:${Minutes}`
  } else if (flag == 4) {
    return `${month}-${date}  ${Hours}:${Minutes}:${Seconds}`
  }
}


// 取小数点 后两位
function timeCurrentMillFn(timeCurrent){
  if (String(timeCurrent).indexOf('.') != -1) {
    let timeString = String(timeCurrent).split('.')
    let timeString_1 = timeString[1].substr(0, 2)
    let time = timeString[0] + '.' + timeString_1
    return `${time}`;
  } else {
    return `${timeCurrent}`;
  }

}



function readableFileSize(size) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while(size >= 1024) {
        size /= 1024;
        ++i;
    }
    return size.toFixed(2) + '' + units[i];
}

// 对钱做处理
function Fen2Yuan( num ) {
    if ( typeof num !== "number" || isNaN( num ) ) return null;
    return number0(( num / 100 ).toFixed( 2 ));
}


//去除 0 
function number0(num) {
    var str;
    if(String(num).indexOf('.')) {
        var arr =  String(num).split('.');
        if(arr[1].split('')[0] == 0) {
            str = arr[0];
        } else {
            str = arr[0]+'.'+arr[1].split('')[0];
        }
    }
    return str;
}


// 截取字符串
function InterceptionString(str, length) {
    if(str.length >= length) str = str.replace(/^(.......).*(..........)$/,"$1***$2")
    return str
}










