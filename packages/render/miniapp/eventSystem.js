import { returnFalse , toLowerCase} from 'react-core/util';
import { classCached } from './utils';
import { Renderer } from 'react-core/createRenderer';
export var webview = {};
export var eventSystem = {
    dispatchEvent: function(e) {
      if (e.type == 'message') {
        if (webview.instance && webview.cb) {
          webview.cb.call(webview.instance, e);
        }
        return;
      }
        var target = e.currentTarget;
        var dataset = target.dataset || {};
        var eventUid = dataset[toLowerCase(e.type) + 'Uid']; //函数名
        var classUid = dataset.classUid; //类ID
        var componentClass = classCached[classUid]; //类
        var instanceUid = dataset.instanceUid; //实例ID
        var instance = componentClass[instanceUid];
        var fiber = instance.$$eventCached[eventUid + 'Fiber'];
        if (e.type == 'change' && fiber && fiber.type === 'input') {
            //微信的change会误触发
            if (fiber.props.value + '' == e.detail.value) {
                return;
            }
        }
        var key = dataset['key'];
        eventUid += key != null ? '-' + key : '';
        if (instance) {
            Renderer.batchedUpdates(function() {
                try {
                    var fn = instance.$$eventCached[eventUid];
                    fn && fn.call(instance, createEvent(e, target));
                } catch (err) {
                    // eslint-disable-next-line
                    console.log(err.stack);
                }
            }, e);
        }
    }
};


//创建事件对象
function createEvent(e, target) {
    var event = {};
    if (e.detail) {
        event.detail = e.detail;
        Object.assign(event, e.detail);
        Object.assign(target, e.detail);
    }
    event.stopPropagation = function() {
        // eslint-disable-next-line
        console.warn("小程序不支持这方法，请使用catchXXX");
    };
    event.preventDefault = returnFalse;
    event.type = e.type;
    event.currentTarget = event.target = target;
    event.touches = e.touches;
    event.timeStamp = new Date() - 0;
    return event;
}


