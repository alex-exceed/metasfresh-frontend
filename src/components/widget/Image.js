import React, { Component } from 'react';
import { getImageAction, postImageAction } from '../../actions/AppActions';

class Image extends Component{
    constructor(props){
        super(props);

        this.state = {
            imageSrc: '',
            usingCamera: false,
            isLoading: false,
            stream: {}
        };
    }

    componentDidMount(){
        const {data} = this.props;

        if (!data.value){
            return;
        }

        return this.updateImagePreview(data.value);
    }

    isCameraAvailable(){
        return (
                !~location.protocol.indexOf('https') ||
                !~location.href.indexOf('localhost')
            ) &&
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia
    }

    uploadBlob(blob){
        const {data, handlePatch} = this.props;

        let fd = new FormData();
        fd.append('file', blob);

        return new Promise(resolve => {
            this.setState({
                isLoading: true
            }, () => {
                resolve();
            });
        })
            .then(() => {
                return postImageAction(fd)
            })
            .then(imageId => {
                return this.updateImagePreview(imageId)
            })
            .then(imageId => {
                return handlePatch(data.field, imageId)
            })
            .then(() => {
                return new Promise(resolve => {
                    this.setState({
                        isLoading: false
                    }, () => {
                        resolve();
                    })
                })
            })

    }

    updateImagePreview(id){
        return getImageAction(id)
            .then(blob => {
                return new Promise(resolve => {
                    let reader = new FileReader();
                    reader.onload = function () {
                        return resolve(reader.result);
                    };
                    reader.readAsDataURL(blob);
                });
            })
            .then(imageBase64 => {
                this.setState({
                    imageSrc: imageBase64
                });

                return id;
            });
    }

    takeSnapshot() {
        const width = this.camera.offsetWidth;
        const height = this.camera.offsetHeight;
        
        console.log(width, height);

        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        let context = canvas.getContext('2d');
        context.drawImage(this.camera, 0, 0, width, height);

        // upload the picture taken
        canvas.toBlob(blob => {
            this.uploadBlob(blob)
                .then(() => {
                    return this.stopUsingCamera()
                })
        })
    }

    stopUsingCamera(){
        const { stream } = this.state;

        return new Promise(resolve => {
            this.setState({
                usingCamera: false
            }, () => {
                // stop using camera
                stream.getVideoTracks()[0].stop();
                resolve();
            })
        })
    }

    handleCamera(){
        this.setState({
            usingCamera: true
        }, () => {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: 400,
                    height: 300
                }
            })
                .then(stream => {
                    this.camera.src = window.URL.createObjectURL(stream);
                    this.camera.onloadedmetadata = () => {
                        this.camera.play();
                    };

                    this.camera.addEventListener('click',
                        () => this.takeSnapshot()
                    );
                    this.setState({
                        stream: stream
                    });
                })
        });
    }

    handleUploadFile(){
        this.uploadBlob(this.imageInput.files[0]);
    }

    renderVideoPreview(){
        const {isLoading} = this.state;
        return <div
            className={'camera-preview' + (isLoading ? ' loading' : '')}
            >
                <video ref={c => this.camera = c} />
                {isLoading && <div className="preview-loader"></div>}
            </div>
    }

    renderUsingCameraControls(){
        return <div>
            <div
                className="btn btn-meta-outline-secondary btn-sm btn-distance-3"
                onClick={() => this.takeSnapshot()}
            >
                <i className="meta-icon-photo"/>
                Capture
            </div>
            <div
                className="btn btn-meta-outline-secondary btn-sm"
                onClick={() => this.stopUsingCamera()}
            >
                <i className="meta-icon-close-alt"/>
                Cancel
            </div>
        </div>
    }

    renderRegularCameraControl(){
        return <div
                className="btn btn-block btn-meta-outline-secondary btn-sm"
                onClick={() => this.handleCamera()}
            >
                <i className="meta-icon-photo"/>
                Take from camera
            </div>
    }

    render(){
        const { imageSrc, usingCamera } = this.state;
        const { fields, readonly } = this.props;

        return(
            <div className="form-control-label image-widget">
                {imageSrc ?
                    <div className="image-preview">
                        <img
                            src={imageSrc}
                            alt="image"
                            className="img-fluid"
                        />
                    </div>
                    :
                    <div className="image-placeholder">
                        <div
                            className="placeholder-value"
                        >{fields[0].emptyText}</div>
                    </div>
                }

                {usingCamera && this.renderVideoPreview()}

                {!readonly && <div
                    className=" image-source-options"
                >
                    <label
                        className="btn btn-meta-outline-secondary btn-sm"
                    >
                        <input
                            className="input"
                            type="file"
                            onChange={(e) => this.handleUploadFile(e)}
                            ref={c => this.imageInput = c}
                        />
                        <div className="text-content">
                            <i className="meta-icon-upload" />
                            Upload a photo
                        </div>
                    </label>
                    {
                        this.isCameraAvailable() &&
                        (usingCamera ?
                            this.renderUsingCameraControls() :
                            this.renderRegularCameraControl()
                        )
                    }
                </div>}
            </div>
        )
    }
}

export default Image;
