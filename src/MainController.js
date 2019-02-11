import React from 'react';
import D3Controller from './d3Controller';
import BrushItem from './BrushItem';
import AnnotatePopUp from './AnnotatePopUp';

export default class extends React.Component {
	constructor(props) {
		super(props); // props: initial: [dataset, [start, range]]
		this.d3child = React.createRef();
		this.state = {
			is_editing: false,
			brushes: [],
			has_zoomed: true,
			zoom_times : [],
			// For point annotations
			screenPosY: 0,
			screenPosX: 0,
			is_annotating: false,
			startTime: null,
			endTime: null,
			annotations: [],
			newAnnotationId: 0

		};

		this.d3WrapStyle = {
			marginLeft: "300px"
		};

		this.brushWrapStyle = {
			position: "absolute",
			top: "0",
			left: "0",
			bottom: "0",
			width: "308px",
			borderRight: "1px solid #000",
			overflowX: "scroll",
		};

		this.brushInnerWrapStyle = {
			position: "relative"
		};

		this.buttonWrapStyle = {
			borderBottom: "1px solid #000"
		};

		this.buttonStyle = {
			display: "block",
			marginLeft: "auto",
			marginRight: "auto",
			marginTop: "30px",
			marginBottom: "25px"
		};

		this.mainStyle = {
			fontFamily: "sans-serif"
		};

		this.brushListMargin = {
			paddingBottom: "100px"
		};
	}
	
	onEditZoomToggle = () => this.setState(state_ => ({
		is_editing: !state_.is_editing
	}));
	
	onAddBrush = brush => this.setState(state_ => ({
		brushes: state_.brushes.concat([brush])
	}));

	onUpdateBrushes = newBrushes => this.setState(state_ => ({
		brushes: newBrushes
	}));
	
	onEditBrush = brush => this.setState(state_ => {
		const idx = state_.brushes.indexOf(brush);
		if(idx !== -1) {
			// TODO server calls here
			onEditBrush();
		}
	});

	onDeleteBrush = i => this.setState(state_ => {
		state_.brushes.splice(i, 1);
		return { 'brushes': state_.brushes };
	});

	onBrushZoom = i => this.setState(state_ => {
		this.d3child.current.callZoom(state_.brushes[i].times);
	});

	openNewAnnotation = d => this.setState(state_ => {
		// do position logic
		return {
			screenPosY: d.y,
			screenPosX: d.x,
			is_annotating: true,
			annotStart: d.startTime
		};
	});

	cancelAnnotation = () => this.setState(state_ => ({
		screenPosY: 0,
		screenPosX: 0,
		is_annotating: false,
		annotStart: null
	}));

	addAnnotation = d => {
		const newAnnotations = this.state.annotations;
		newAnnotations.push(d);
		newAnnotations.sort((a, b) => a.startTime - b.startTime);
		this.setState(state_ => ({
			annotations: newAnnotations,
			screenPosY: 0,
			screenPosX: 0,
			is_annotating: false,
			startTime: null,
			endTime: null,
			newAnnotationId: state_.newAnnotationId + 1
		}))
	};

	typeToString = type => {
		switch(type) {
			case("onset"):
				return "Seizure Onset";
				break;
			case("offset"):
				return "Seizure Offset";
				break;
			case("patient"):
				return "Patient Data";
				break;
		}
	}

	
	render = () => <div style={this.mainStyle}>
		<AnnotatePopUp
				startTime={this.state.annotStart}
				screenPosY={this.state.screenPosY}
				screenPosX={this.state.screenPosX}
				is_annotating={this.state.is_annotating}
				addAnnotation={this.addAnnotation}
				cancelAnnotation={this.cancelAnnotation}
			/>
		<div style={this.d3WrapStyle}>
			<D3Controller
				{...this.props}
				ref={this.d3child}
				is_editing={this.state.is_editing}
				onAddBrush={this.onAddBrush}
				onUpdateBrush={this.onEditBrush}
				onDeleteBrush={this.onDeleteBrush}
				onUpdateBrushes={this.onUpdateBrushes}
				openNewAnnotationPopUp={this.openNewAnnotation}
				width={960}
				height={640}
				/>
		</div>
		<div style={this.brushWrapStyle}>
			<div style={this.brushInnerWrapStyle}>
				<div style={this.buttonWrapStyle}> 
					<button style={this.buttonStyle} className="edit-zoom-toggle" id="edit-zoom-toggle" type="button" onClick={this.onEditZoomToggle}>
						{this.state.is_editing ? 'Zoom/Pan' : 'Annotate'}
					</button>
				</div>
				<div className="brush-list" style={this.brushListMargin} id="brush-list">
					<div className="annotationList">
						{this.state.annotations.map((annot, index) =>
							<div key={"annot-" + index}>
								<div>{annot.startTimeString + " - " + this.typeToString(annot.type)}</div>
								<div>{annot.notes}</div>
							</div>
						)}
					</div>
					{this.state.brushes.map((brush, i) => 
						<BrushItem
							key={'brush-item-' + i}
							seizureId={i}
							brush={brush}
							onBrushZoom={this.onBrushZoom}
						/>
					)}
				</div>
			</div>
		</div>
	</div>;
}