const data = {
    '0':{
        id:0,
        name:'根目录'
    },
    '1':{
        id:1,
        name:'音乐',
        pId:0
    },
    '2':{
        id:2,
        name:'电影',
        pId:0
    },
    '3':{
        id:3,
        name:'周杰伦',
        pId:1
    },
    '4':{
        id:4,
        name:'林俊杰',
        pId:1
    },
    '5':{
        id:5,
        name:'最后的战役',
        pId:3
    },
    '6':{
        id:6,
        name:'成龙',
        pId:2
    },
    '7':{
        id:7,
        name:'醉拳',
        pId:6
    },
    '8':{
        id:8,
        name:'新警察故事',
        pId:6
    },
    '9':{
        id:9,
        name:'嘿嘿嘿',
        pId:0,
        icon:'./images/icon/China.png'
    },
    '10':{
        id:10,
        name:'小日本',
        pId:9,
        icon:'./images/icon/Japan.png'
    },
    '11':{
        id:11,
        name:'高丽棒子',
        pId:9,
        icon:'./images/icon/Korea.png'
    },
    '12':{
        id:12,
        name:'小洋人',
        pId:9,
        icon:'./images/icon/Groritannien.png'
    }
};


//方法

//根据id获取指定的数据
function getItemById(db,id){
    return db[id];
};

//根据id获取当前层级的所有子文件(一层)
function getChildrenById(db,id){
    const rt = [];
    for(let key in db){
        if(db[key].pId === id) {
            rt.push(db[key])
        }
    }
    return rt;
};
    

//根据id获取到他和他的所有父级  (自己的方法)  也可以递归拼接数组
function getAllParent(data,id){
    const rt =[];
    let now = data[id];
    rt.push(now);
    while(typeof now.pId !=='undefined'){
        now = data[now.pId];
        rt.push(now);
    }
    return rt.reverse();
};

//根据指定id删除对应数据  以及它所有的子集
function deleteItemById(db,id){
    if(!id) return false;
    delete db[id];
    let children = getChildrenById(db,id);
    let len = children.length;
    if(len){
        for(var i=0;i<len;i++){
            deleteItemById(db,children[i].id);
        }
    } 
    return true;
}
// 将选中的元素缓存转成数组
function getCheckedFileFromBuffer(){
    let dataNew = [];
    for(let key in checkedBuffer){
      if(key !== 'length'){
        const currentItem = checkedBuffer[key];
        dataNew.push({
          newId: parseFloat(key),
          item: currentItem
        });
      }
    }
    return dataNew;
}
//名称是否可用
function nameCanUse(db, id, text){
    const currentData = getChildrenById(db, id);
    return currentData.every(item => item.name !== text);
}
// 添加一条数据
function addOneData(db, data){
    return db[data.id] = data;
  }
//判断是否可以移动数据 1成功    是否当前选中的是想要移动到的子集2  是否有名称相同的文件3  是否移动到自己的目录4
function isCanMove(db,currentId,targetId){
    var currentData = getItemById(db,currentId);
    var targetParentData = getAllParent(db,targetId);
    console.log(targetParentData);
    //是否子集
    if(targetParentData.indexOf(currentData)!==-1){
        return 2 ;
    }
    if(currentData.pId ===targetId){
        return 4 ;
    }
    if(!nameCanUse(db,targetId,currentData.name)){
        return 3 ;
    }
    return 1 ;
}
//移动文件
function moveToTarget (db,currentFileId,targetId){
    db[currentFileId].pId = targetId;
}

